const fs = require('fs-extra')
const path = require('path')
const request = require('request')
const stream = require('stream')
const util = require('util')
const pump = util.promisify(require('pump'))
const pipeline = util.promisify(stream.pipeline)
const zlib = require('zlib')
const csv = require('csv-parser')

function parseDateTime (dateTimeString) {
  const year = parseInt(dateTimeString.slice(0, 4), 10)
  const month = parseInt(dateTimeString.slice(4, 6), 10) - 1
  const day = parseInt(dateTimeString.slice(6, 8), 10)
  const hour = parseInt(dateTimeString.slice(8, 10), 10)

  return new Date(year, month, day, hour)
}

const datagouvDatasetUrl = 'https://www.data.gouv.fr/api/1/datasets/6569b4473bedf2e7abad3b72/'
module.exports = async (accessToken, processingConfig, tmpDir, axios, log, dataset) => {
  await log.step('Récupération de la liste des fichiers')
  await fs.ensureDir(tmpDir)
  const datagouvResult = (await axios({ method: 'get', url: datagouvDatasetUrl, Headers: { 'X-Fields': 'resources' } })).data.resources

  for (const fileObject of datagouvResult) {
    if (fileObject.type !== 'main') {
      continue
    }
    const nameTab = fileObject.title.split('_')
    const departement = nameTab[2] // Département du fichier
    const startYear = nameTab[4].split('-')[0] // Année de début du fichier
    const endYear = nameTab[4].split('-')[1] // Année de fin du fichier

    // Si il n'y a pas de filtre sur l'année ou que l'année du fichier est dans le filtre
    // Et il n'y a pas de filtre sur le département ou que le département du fichier est dans le filtre
    if ((!processingConfig.years || (processingConfig.years.some(filterYear => filterYear >= startYear && filterYear <= endYear))) &&
      (!processingConfig.departements || processingConfig.departements.includes(departement))) {
      await log.step(`Traitement du fichier ${fileObject.title}`)
      await log.info('Téléchargement & décompression du fichier')
      const fileName = fileObject.title + '.csv'

      await pipeline(
        request(fileObject.url),
        zlib.createGunzip(),
        fs.createWriteStream(path.join(tmpDir, fileName))
      )

      await log.info('Lecture & transformation du fichier du fichier')
      let transformedLines = []
      let lastDateAdded = 0
      let lastStation = ''
      await pump(
        fs.createReadStream(path.join(tmpDir, fileName), { objectMode: true }),
        csv({ separator: ';' }),
        new stream.Transform({
          objectMode: true,
          transform: async (line, _, next) => {
            if (processingConfig.years) {
              const yearLine = parseInt(line.AAAAMMJJHH.slice(0, 4))
              if (!processingConfig.years.some(filterYear => filterYear === yearLine)) {
                return next()
              }
            }
            if (lastDateAdded > (line.AAAAMMJJHH - processingConfig.frequency) && lastStation === line.NUM_POSTE) {
              return next()
            }
            const transformedLine = {
              num_poste: line.NUM_POSTE,
              nom_poste: line.NOM_USUEL,
              date: parseDateTime(line.AAAAMMJJHH),
              heure: parseInt(line.AAAAMMJJHH.slice(-2)),
              latitude: parseFloat(line.LAT),
              longitude: parseFloat(line.LON),
              departement,
              altitude: parseInt(line.ALTI)
            }

            const fieldsToCheck = [
              { key: 'precipitation', source: 'RR1', type: 'float' },
              { key: 'temperature', source: ' T', type: 'float' },
              { key: 'humidite', source: 'U', type: 'float' },
              { key: 'pression', source: 'PSTAT', type: 'float' },
              { key: 'vent', source: 'FF', type: 'float' },
              { key: 'vent_dir', source: 'DD', type: 'int' },
              { key: 'temps_ensoleillement', source: 'INS', type: 'int' }
            ]
            fieldsToCheck.forEach(field => {
              const value = line[field.source].trim()
              if (value !== '') {
                transformedLine[field.key] = field.type === 'float' ? parseFloat(value) : parseInt(value)
              }
            })

            // Si toutes les valeurs sont vides, on ignore la ligne
            if (Object.keys(transformedLine).length > 8) {
              lastDateAdded = line.AAAAMMJJHH
              lastStation = line.NUM_POSTE
              transformedLines.push(transformedLine)
            }

            if (transformedLines.length === 5000) {
              await log.info('Envoi de 5000 lignes')
              await axios.post(`api/v1/datasets/${dataset.id}/_bulk_lines`, transformedLines)
              transformedLines = []
              await log.info('Lignes envoyées')
            }
            next()
          }
        })
      )

      await log.info(`Envoi de ${transformedLines.length} lignes`)
      await axios.post(`api/v1/datasets/${dataset.id}/_bulk_lines`, transformedLines)
    }
  }

  if (processingConfig.cleanFiles) {
    await log.step('Suppression des fichiers temporaires')
    await fs.remove(path.join(tmpDir))
  }
}
