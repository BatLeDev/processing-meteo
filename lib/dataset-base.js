module.exports = {
  isRest: true,
  title: 'Meteo',
  primaryKey: [
    'num_poste',
    'date'
  ],
  schema: [
    {
      key: 'num_poste',
      type: 'integer',
      title: 'Numéro du poste',
      description: 'Numéro de la station météo'
    },
    {
      key: 'nom_poste',
      type: 'string',
      title: 'Nom du poste',
      description: 'Nom de la station météo'
    },
    {
      key: 'date',
      type: 'string',
      format: 'date-time',
      title: 'Date & heure',
      description: 'La date et l\'heure de la mesure'
    },
    {
      key: 'heure',
      type: 'integer',
      title: 'Heure',
      description: 'L\'heure de la mesure'
    },
    {
      key: 'latitude',
      type: 'number',
      title: 'Latitude',
      description: 'La latitude de la station météo'
    },
    {
      key: 'longitude',
      type: 'number',
      title: 'Longitude',
      description: 'La longitude de la station météo'
    },
    {
      key: 'departement',
      type: 'string',
      title: 'Département',
      description: 'Le numéro de département de la station météo'
    },
    {
      key: 'altitude',
      type: 'integer',
      title: 'Altitude',
      description: 'L\'altitude de la station météo'
    },
    {
      key: 'precipitation',
      type: 'number',
      title: 'Précipitation',
      description: 'Quantité de précipitation en mm tombé dans l\'heure'
    },
    {
      key: 'temperature',
      type: 'number',
      title: 'Température',
      description: 'Température en °C'
    },
    {
      key: 'humidite',
      type: 'number',
      title: 'Humidité',
      description: 'Humidité en %'
    },
    {
      key: 'pression',
      type: 'number',
      title: 'Pression',
      description: 'Pression en hPa'
    },
    {
      key: 'vent',
      type: 'number',
      title: 'Force du vent',
      description: 'La force du vent moyenné sur 10 minues'
    },
    {
      key: 'vent_dir',
      type: 'number',
      title: 'Direction du vent',
      description: 'Direction du vent en rose de 0 à 360°'
    },
    {
      key: 'temps_ensoleillement',
      type: 'number',
      title: 'Temps d\'ensoleillement',
      description: 'Insolation horraire en minutes'
    }
  ]
}
