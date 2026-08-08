import type { Content } from './types';

const en: Content = {
  meta: {
    title: 'Evgeny Kunitskiy — Managing Director, TransStroy Development Group',
    description:
      'Evgeny Kunitskiy is Managing Director of TransStroy Development Group (TSD Group), building residential districts and infrastructure across the Russian Arctic and Far East.',
  },

  nav: {
    about: 'Profile',
    scale: 'Scale',
    recognition: 'Recognition',
    geography: 'Geography',
    projects: 'Projects',
    press: 'Speaking',
    contact: 'Contact',
  },

  preloader: {
    line1: 'We build',
    line2: 'where no one',
    line3: 'else builds',
  },

  hero: {
    role: 'Managing Director, TransStroy Development Group',
    name: 'Evgeny',
    surname: 'Kunitskiy',
    tagline: ['Arctic', 'Far East', 'Development'],
    scrollHint: 'Scroll down',
    skip: 'Skip',
  },

  about: {
    section: 'Profile',
    heading: 'The person behind the projects',
    lead:
      'Evgeny Kunitskiy is Managing Director of TransStroy Development Group (TSD Group), an investment and construction holding working in regions with severe climate conditions.',
    body: [
      'Under his management the group carries out integrated development across the Arctic zone of Russia and the Far Eastern Federal District — residential districts along with engineering infrastructure, boiler plants, treatment facilities and utility networks.',
      'He heads group companies in several regions, including the specialised developer TSD in Vladivostok and TSD Razvitie in Chita, and speaks at industry events on delivering investment projects in demanding territories.',
      'His professional track record is tied to construction in regions where a short building season, permafrost and supply lines of thousands of kilometres make conventional solutions inapplicable.',
    ],
    quote: 'We build where no one else builds.',
    portraitLabel: 'Portrait',
    portraitNote: 'A photograph will go here',
  },

  stats: {
    section: 'Scale',
    heading: 'The group in numbers',
    items: [
      { value: 15, suffix: '+', label: 'years in the market' },
      { value: 650000, suffix: ' m²', label: 'built and under construction' },
      { value: 5000, suffix: '+', label: 'employees' },
      { value: 14, suffix: '', label: 'regions of operation' },
      { value: 256, suffix: ' bn ₽', label: 'investment project portfolio' },
      { value: 58.5, decimals: 1, suffix: ' bn ₽', label: 'turnover in 2024' },
      { value: 2.9, decimals: 1, suffix: ' m m²', label: 'residential land bank' },
      { value: 5.5, decimals: 1, suffix: ' bn ₽', label: 'contracts with DOM.RF' },
    ],
    note: 'The first row is TSD Group data. The second covers investment activity for the 2024 financial year.',
  },

  recognition: {
    section: 'Recognition',
    heading: 'Industry and development institutions',
    lead:
      'The group delivers its projects alongside state programmes and development institutions — an outside check that the talk of scale is backed by commitments.',
    items: [
      {
        source: 'Ministry of Construction',
        // TODO: confirm the status — a nomination or an award already granted.
        title: 'Nominated for a departmental award',
        body:
          'For a personal contribution to the construction industry and to national housing policy.',
      },
      {
        source: 'DOM.RF',
        title: 'Equity participation contracts worth ₽5.5 bn',
        body:
          'Work with the state housing development institution — direct participation in federal housing mechanisms.',
      },
      {
        source: 'Government of Russia',
        title: 'Affordable rental housing in the Far East',
        body:
          'Participation in the federal rental housing programme for the Far Eastern Federal District.',
      },
      {
        source: 'Integrated area development',
        title: 'Districts delivered with their infrastructure',
        body:
          'Projects are delivered together with social, transport and utility infrastructure, not as residential blocks alone.',
      },
      {
        source: 'Preferential regimes',
        title: 'Priority development areas and the Arctic zone',
        body:
          'Projects are delivered under the priority development area and Russian Arctic zone regimes.',
      },
    ],
    note: 'Based on documents provided by the group.',
  },

  principles: {
    section: 'Approach',
    heading: 'Why the difficult regions',
    items: [
      {
        index: '01',
        title: 'A short season',
        body:
          'In the Arctic the working window is set by weather. Planning is built around logistics and material delivery rather than a comfortable schedule.',
      },
      {
        index: '02',
        title: 'Soils and permafrost',
        body:
          'Foundations in permafrost are engineered differently. Pile bases and thermal protection of the ground are part of the core design, not an option.',
      },
      {
        index: '03',
        title: 'Full cycle',
        body:
          'Beyond housing, the group delivers boiler plants, treatment facilities, external networks and landscaping — everything a district needs to actually open.',
      },
      {
        index: '04',
        title: 'Working with the state',
        body:
          'Projects are delivered alongside national affordable housing programmes and the development institutions of the Arctic and the Far East.',
      },
    ],
  },

  geography: {
    section: 'Geography',
    heading: 'From Murmansk to Vladivostok',
    lead:
      'The group operates across the Russian Arctic zone and the Far Eastern Federal District — a territory spanning nine time zones.',
    arcticLabel: 'Arctic zone',
    farEastLabel: 'Far East',
    regions: [
      'Arkhangelsk Oblast',
      'Murmansk Oblast',
      'Republic of Karelia',
      'Komi Republic',
      'Nenets AO',
      'Yamalo-Nenets AO',
      'Krasnoyarsk Krai',
      'Sakha Republic (Yakutia)',
      'Chukotka AO',
      'Primorsky Krai',
      'Sakhalin Oblast',
      'Khabarovsk Krai',
      'Zabaykalsky Krai',
      'Republic of Buryatia',
    ],
  },

  projects: {
    section: 'Projects',
    heading: 'Built and under construction',
    lead: 'Residential complexes and districts across the Arctic and the Far East.',
    items: [
      {
        name: 'Arktika Park',
        city: 'Arkhangelsk',
        region: 'Arkhangelsk Oblast',
        coords: [64.54, 40.54],
        status: 'Under construction',
        description:
          'A satellite town in the Arctic zone designed for 28,000 residents.',
        image: '/images/arktika-park.webp',
      },
      {
        name: 'Bereg Arktiki',
        city: 'Murmansk',
        region: 'Murmansk Oblast',
        coords: [68.97, 33.07],
        status: 'Under construction',
        description: 'A residential complex above the Arctic Circle.',
        image: '/images/murmansk-kvartal.webp',
      },
      {
        name: 'Kenon Riviera Park',
        city: 'Chita',
        region: 'Zabaykalsky Krai',
        coords: [52.03, 113.5],
        status: 'Under construction',
        description: 'A residential complex on Lake Kenon.',
        image: '/images/kenon-riviera.webp',
      },
      {
        name: 'Pavlovicha Street Complex',
        city: 'Khabarovsk',
        region: 'Khabarovsk Krai',
        coords: [48.48, 135.07],
        status: 'Under construction',
        description: 'A residential complex in the central part of the city.',
        image: '/images/khabarovsk-pavlovicha.webp',
      },
      {
        name: 'International Residential Quarter',
        city: 'Zabaykalsk',
        region: 'Zabaykalsky Krai',
        coords: [49.65, 117.33],
        status: 'Under construction',
        description: 'A residential quarter on the border with China.',
        image: '/images/zabaykalsk-kvartal.webp',
      },
      {
        name: 'Solnechnaya Street development',
        city: 'Kirovsk',
        region: 'Murmansk Oblast',
        coords: [67.61, 33.67],
        status: 'Under construction',
        description: 'A residential complex in a town above the Arctic Circle.',
        image: '/images/kirovsk-solnechnaya.webp',
      },
      {
        name: 'Moroshkovaya Street development',
        city: 'Monchegorsk',
        region: 'Murmansk Oblast',
        coords: [67.94, 32.97],
        status: 'Under construction',
        description:
          'A residential complex in a single-industry town on the Kola Peninsula.',
        image: '/images/monchegorsk-moroshkovaya.webp',
      },
    ],
  },

  company: {
    section: 'Company',
    heading: 'TransStroy Development Group',
    lead:
      'A federal developer specialising in construction in regions with severe climate conditions.',
    body: [
      'The group acts as developer and general contractor: residential complexes and districts, social and commercial facilities, industrial and civil construction, engineering infrastructure and landscaping.',
      'Work is carried out alongside national affordable housing programmes and the development institutions of the Arctic and the Far East.',
    ],
    timeline: [
      {
        year: '2008',
        title: 'The beginning',
        body: 'The group starts out in construction contracting.',
      },
      {
        year: '2022',
        title: 'Vladivostok',
        body:
          'The specialised developer TSD is registered — the group’s Far East division.',
      },
      {
        year: '2024',
        title: 'The Arctic',
        body:
          'Project companies are set up in Arkhangelsk and Murmansk for Arctic housing projects.',
      },
      {
        year: '2025',
        title: 'Transbaikal',
        body: 'The Chita division, TSD Razvitie, is launched.',
      },
    ],
  },

  press: {
    section: 'Speaking',
    heading: 'Public position',
    lead:
      'Evgeny Kunitskiy speaks at industry events on development in demanding territories.',
    items: [
      {
        date: '27.11.2025',
        event: 'Far Eastern Construction Forum',
        place: 'Vladivostok',
        topic: 'Delivering investment projects in the Far East',
      },
    ],
  },

  contact: {
    section: 'Contact',
    heading: 'Get in touch directly',
    lead: 'A messenger is the fastest way to reach him.',
    telegram: 'Telegram',
    whatsapp: 'WhatsApp',
    max: 'MAX',
    office: 'Office',
    officeAddress: 'Dneprovskaya St. 107, office 4, Vladivostok',
    company: 'TransStroy Development LLC',
  },

  footer: {
    rights: 'All rights reserved',
    disclaimer:
      'Project information is provided for reference only and does not constitute a public offer.',
  },

  ui: {
    sound: 'Sound',
    soundOn: 'on',
    soundOff: 'off',
    langLabel: 'Language',
  },
};

export default en;
