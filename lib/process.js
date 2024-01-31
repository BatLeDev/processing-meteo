const fs = require('fs-extra')
const path = require('path')
const csv = require('csv-parser')
const stream = require('stream')
const util = require('util')
const gunzip = util.promisify(require('gunzip-file'))
const pump = util.promisify(require('pump'))

const datagouvDatasetUrl = 'https://www.data.gouv.fr/api/1/datasets/6569b4473bedf2e7abad3b72/'
module.exports = async (accessToken, processingConfig, tmpDir, axios, log, dataset) => {
  await log.step('Récupération de la liste des fichiers')
  await fs.ensureDir(path.join(tmpDir, 'compressedFiles'))

  const datagouvResult = (await axios({ method: 'get', url: datagouvDatasetUrl })).data.resources

  for (const fileObject of datagouvResult) {
    await log.step(`Récupération du fichier ${fileObject.title}`)

    if (fileObject.title.startsWith('HOR_departement_')) {
      await log.info('Téléchargement')
      const res = await axios({ method: 'get', url: fileObject.url, responseType: 'stream' })
      const fileName = fileObject.title.replace(/^HOR_departement_/, '') + '.csv'

      await pump(res.data, fs.createWriteStream(path.join(tmpDir, 'compressedFiles', (fileName + '.gz'))))
      await log.info('Fichier téléchargé')

      await log.info('Décompression')
      await gunzip(path.join(tmpDir, 'compressedFiles', (fileName + '.gz')), path.join(tmpDir, fileName))
      await log.info('Fichier décompressé')

      await log.info('Lecture et transformation du fichier du fichier')
      const departement = fileName.split('_')[0]
      const transformedLines = []

      await pump(
        fs.createReadStream(path.join(tmpDir, fileName), { objectMode: true }),
        csv({ separator: ';' }),
        new stream.Transform({
          objectMode: true,
          transform: async (line, _, next) => {
            const transformedLine = {
              num_poste: line.NUM_POSTE,
              nom_poste: line.NOM_USUEL,
              date: line.AAAAMMJJHH,
              heure: line.AAAAMMJJHH.slice(-2),
              latitude: line.LAT,
              longitude: line.LON,
              departement,
              altitude: line.ALTI,
              precipitation: line.RR1.trim(),
              temperature: line[' T'].trim(),
              humidite: line.U.trim(),
              pression: line.PSTAT.trim(),
              vent: line.FF.trim(),
              vent_dir: line.DD.trim(),
              temps_ensoleillement: line.INS.trim()
            }

            // Si toutes les valeurs sont vides, on ignore la ligne
            const values = Object.values(transformedLine).slice(7)
            const checkAllEmpty = values.every(value => value === '')
            if (!checkAllEmpty) {
              transformedLines.push(transformedLine)
            }
            next()
          }
        })
      )

      await log.info(`Ligne ${transformedLines.length} traitée`)

      await log.info('Envoi des données')
      await axios.post(`api/v1/datasets/${dataset.id}/_bulk_lines`, transformedLines)
      await log.info('Données envoyées')
    } else {
      await log.info('Fichier ignoré')
    }
  }

  if (processingConfig.cleanFiles) {
    await log.step('Suppression des fichiers temporaires')
    await fs.remove(path.join(tmpDir))
  }
}
