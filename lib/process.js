const fs = require('fs-extra')
const path = require('path')
const csv = require('csv-parser')
const stream = require('stream')
const util = require('util')
const gunzip = util.promisify(require('gunzip-file'))
const pump = util.promisify(require('pump'))

const datagouvDatasetUrl = 'https://www.data.gouv.fr/api/1/datasets/6569b51ae64326786e4e8e1a/'
module.exports = async (accessToken, processingConfig, tmpDir, axios, log, dataset) => {
  await log.step('Récupération de la liste des fichiers')
  await fs.ensureDir(path.join(tmpDir, 'compressedFiles'))

  const datagouvResult = (await axios({ method: 'get', url: datagouvDatasetUrl })).data.resources

  for (const fileObject of datagouvResult) {
    await log.step(`Récupération du fichier ${fileObject.title}`)

    if (fileObject.title.startsWith('QUOT_departement_') && (
      fileObject.title.endsWith('_periode_1950-2022_RR-T-Vent') ||
      fileObject.title.endsWith('_periode_2023-2024_RR-T-Vent.csv.gz')
    )) {
      await log.info('Téléchargement')
      const res = await axios({ method: 'get', url: fileObject.url, responseType: 'stream' })
      const fileName = fileObject.title
        .replace(/^QUOT_departement_/, '')
        .replace(/_RR-T-Vent$/, '') + '.csv'

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
              date: line.AAAAMMJJ,
              latitude: line.LAT,
              longitude: line.LON,
              departement,
              altitude: line.ALTI,
              precipitation: line.RR,
              temp_min: line.TN,
              temp_max: line.TX,
              temp_moy: line.TM,
              vent_moy: line.FFM
            }
            transformedLines.push(transformedLine)
            next()
          }
        })
      )

      await log.info('Envoi des données')
      await axios.post(`api/v1/datasets/${dataset.id}/_bulk_lines`, transformedLines)
      await log.info('Données envoyées')
    } else {
      await log.info('Fichier ignoré')
    }
  }
}
