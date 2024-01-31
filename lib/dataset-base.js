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
      type: 'date',
      title: 'Date',
      description: 'La date de la mesure'
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
      description: 'Le département de la station météo'
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
      description: 'Quantité de précipitation en mm tombé en 24h'
    },
    {
      key: 'temp_min',
      type: 'number',
      title: 'Température minimale',
      description: 'Température minimale de la journée en °C'
    },
    {
      key: 'temp_max',
      type: 'number',
      title: 'Température maximale',
      description: 'Température maximale de la journée en °C'
    },
    {
      key: 'temp_moy',
      type: 'number',
      title: 'Température moyenne',
      description: 'Température moyenne de la journée en °C'
    },
    {
      key: 'force_vent_moy',
      type: 'number',
      title: 'Force du vent moyenne',
      description: 'Force du vent moyenne en m/s sur la journée (moyenné sur 10 mn)'
    }
  ]
}
