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
      type: 'string',
      title: 'Numéro du poste',
      description: 'Numéro de la station météo',
      'x-capabilities': {
        insensitive: false,
        text: false,
        textStandard: false
      }
    },
    {
      key: 'nom_poste',
      type: 'string',
      title: 'Nom du poste',
      description: 'Nom de la station météo',
      'x-capabilities': {
        insensitive: false
      }
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
      description: 'L\'heure de la mesure',
      'x-capabilities': {
        textStandard: false
      }
    },
    {
      key: 'latitude',
      type: 'number',
      title: 'Latitude',
      description: 'La latitude de la station météo',
      'x-capabilities': {
        textStandard: false,
        values: false
      },
      'x-refersTo': 'http://schema.org/latitude'
    },
    {
      key: 'longitude',
      type: 'number',
      title: 'Longitude',
      description: 'La longitude de la station météo',
      'x-capabilities': {
        textStandard: false,
        values: false
      },
      'x-refersTo': 'http://schema.org/longitude'
    },
    {
      key: 'departement',
      type: 'string',
      title: 'Département',
      description: 'Le numéro de département de la station météo',
      'x-capabilities': {
        insensitive: false,
        text: false
      },
      'x-refersTo': 'http://rdf.insee.fr/def/geo#codeDepartement'
    },
    {
      key: 'altitude',
      type: 'integer',
      title: 'Altitude',
      description: 'L\'altitude de la station météo',
      'x-capabilities': {
        textStandard: false
      }
    },
    {
      key: 'precipitation',
      type: 'number',
      title: 'Précipitation',
      description: 'Quantité de précipitation en mm tombé dans l\'heure',
      'x-capabilities': {
        textStandard: false
      }
    },
    {
      key: 'temperature',
      type: 'number',
      title: 'Température',
      description: 'Température en °C',
      'x-capabilities': {
        textStandard: false
      }
    },
    {
      key: 'humidite',
      type: 'number',
      title: 'Humidité',
      description: 'Humidité en %',
      'x-capabilities': {
        textStandard: false
      }
    },
    {
      key: 'pression',
      type: 'number',
      title: 'Pression',
      description: 'Pression en hPa',
      'x-capabilities': {
        textStandard: false
      }
    },
    {
      key: 'vent',
      type: 'number',
      title: 'Force du vent',
      description: 'La force du vent moyenné sur 10 minues',
      'x-capabilities': {
        textStandard: false
      }
    },
    {
      key: 'vent_dir',
      type: 'integer',
      title: 'Direction du vent',
      description: 'Direction du vent en rose de 0 à 360°',
      'x-capabilities': {
        textStandard: false
      }
    },
    {
      key: 'temps_ensoleillement',
      type: 'integer',
      title: 'Temps d\'ensoleillement',
      description: 'Insolation horraire en minutes',
      'x-capabilities': {
        textStandard: false
      }
    }
  ]
}
