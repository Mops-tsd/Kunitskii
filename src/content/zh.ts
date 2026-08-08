import type { Content } from './types';

const zh: Content = {
  meta: {
    title: '叶夫根尼·库尼茨基 — 运输建设开发集团总经理',
    description:
      '叶夫根尼·库尼茨基管理运输建设开发集团（TSD Group），该集团在俄罗斯北极地区和远东地区建设住宅区及基础设施。',
  },

  nav: {
    about: '人物',
    scale: '规模',
    recognition: '认可',
    geography: '地域',
    projects: '项目',
    press: '演讲',
    contact: '联系',
  },

  preloader: {
    line1: '我们建设在',
    line2: '无人建设',
    line3: '的地方',
  },

  hero: {
    role: '运输建设开发集团总经理',
    name: '叶夫根尼',
    surname: '库尼茨基',
    tagline: ['北极', '远东', '开发'],
    scrollHint: '向下滚动',
    skip: '跳过',
  },

  about: {
    section: '人物',
    heading: '项目背后的人',
    lead:
      '叶夫根尼·亚历山德罗维奇·库尼茨基是运输建设开发集团（TSD Group）的管理者，该集团是一家在气候严酷地区施工的联邦级开发商。',
    body: [
      '在他的管理下，集团在俄罗斯北极地区和远东联邦区开展综合开发——从住宅区到工程基础设施、锅炉房、污水处理设施和外部管网。',
      '他领导集团在多个地区的公司，包括符拉迪沃斯托克的专业开发商「TSD」和赤塔的「TSD 发展」，并在行业论坛上就艰难地区投资项目的实施发表演讲。',
      '他的职业道路与在施工季节短暂、永久冻土广布、物流距离长达数千公里的地区从事建设密切相关，这些条件使常规方案无法适用。',
    ],
    quote: '我们建设在无人建设的地方。',
    portraitLabel: '肖像',
    portraitNote: '此处将放置照片',
  },

  stats: {
    section: '规模',
    heading: '集团数据',
    items: [
      { value: 256, suffix: ' 十亿卢布', label: '投资项目组合' },
      { value: 58.5, decimals: 1, suffix: ' 十亿卢布', label: '2024 年集团营业额' },
      { value: 2.9, decimals: 1, suffix: ' 百万 m²', label: '住宅土地储备' },
      { value: 14, suffix: '', label: '业务地区' },
    ],
    note: 'TSD 集团数据；营业额为 2024 年度。',
  },

  recognition: {
    section: '认可',
    heading: '行业与开发机构',
    lead:
      '集团的项目与国家计划及开发机构共同推进——这是对其规模承诺的外部检验。',
    items: [
      {
        source: '俄罗斯建设部',
        // TODO: 需确认状态——提名还是已授予的奖项。
        title: '获部门奖项提名',
        body: '表彰其对建筑行业与国家住房政策的个人贡献。',
      },
      {
        source: 'DOM.RF',
        title: '55 亿卢布股权参与合同',
        body: '与国家住房开发机构合作，直接参与联邦住房机制。',
      },
      {
        source: '俄罗斯政府',
        title: '远东可负担租赁住房',
        body: '参与远东联邦区的联邦租赁住房计划。',
      },
      {
        source: '优惠制度',
        title: '超前发展区与北极区',
        body: '项目在超前发展区和俄罗斯北极区制度下实施。',
      },
    ],
    note: '依据集团提供的文件。',
  },

  principles: {
    section: '方法',
    heading: '为何选择艰难地区',
    items: [
      {
        index: '01',
        title: '短暂的施工季',
        body:
          '在北极，施工窗口由天气决定。规划围绕物流和材料运输展开，而非围绕舒适的工期。',
      },
      {
        index: '02',
        title: '土壤与永久冻土',
        body:
          '永久冻土上的基础设计截然不同。桩基和地基热防护是核心设计的一部分，而非可选项。',
      },
      {
        index: '03',
        title: '全周期',
        body:
          '除住宅外，集团还承担锅炉房、污水处理设施、外部管网和景观建设——这些是社区投入使用的必要条件。',
      },
      {
        index: '04',
        title: '与国家合作',
        body: '项目与国家保障性住房计划以及北极和远东开发机构协同推进。',
      },
    ],
  },

  geography: {
    section: '地域',
    heading: '从摩尔曼斯克到符拉迪沃斯托克',
    lead:
      '集团业务遍及俄罗斯北极地区和远东联邦区——横跨九个时区的广阔疆域。',
    arcticLabel: '北极地区',
    farEastLabel: '远东',
    regions: [
      '阿尔汉格尔斯克州',
      '摩尔曼斯克州',
      '卡累利阿共和国',
      '科米共和国',
      '涅涅茨自治区',
      '亚马尔-涅涅茨自治区',
      '克拉斯诺亚尔斯克边疆区',
      '萨哈（雅库特）共和国',
      '楚科奇自治区',
      '滨海边疆区',
      '萨哈林州',
      '哈巴罗夫斯克边疆区',
      '外贝加尔边疆区',
      '布里亚特共和国',
    ],
  },

  projects: {
    section: '项目',
    heading: '已建成与在建项目',
    lead: '集团在北极和远东地区的住宅综合体与住宅区。',
    items: [
      {
        name: '北极公园',
        city: '阿尔汉格尔斯克',
        region: '阿尔汉格尔斯克州',
        coords: [64.54, 40.54],
        status: '在建',
        description: '北极地区卫星城项目，规划容纳 28,000 名居民。',
        image: '/images/arkhangelsk.webp',
      },
      {
        name: '北极海岸',
        city: '摩尔曼斯克',
        region: '摩尔曼斯克州',
        coords: [68.97, 33.07],
        status: '在建',
        description: '北极圈内的住宅综合体。',
        image: '/images/murmansk.webp',
      },
      {
        name: '克农里维埃拉公园',
        city: '赤塔',
        region: '外贝加尔边疆区',
        coords: [52.03, 113.5],
        status: '在建',
        description: '克农湖畔的住宅综合体。',
        image: '/images/chita.webp',
      },
      {
        name: '巴甫洛维奇街住宅区',
        city: '哈巴罗夫斯克',
        region: '哈巴罗夫斯克边疆区',
        coords: [48.48, 135.07],
        status: '在建',
        description: '位于市中心区域的住宅综合体。',
        image: '/images/khabarovsk.webp',
      },
      {
        name: '国际住宅区',
        city: '后贝加尔斯克',
        region: '外贝加尔边疆区',
        coords: [49.65, 117.33],
        status: '在建',
        description: '中俄边境的住宅区。',
        image: '',
      },
      {
        name: '集团总部',
        city: '符拉迪沃斯托克',
        region: '滨海边疆区',
        coords: [43.12, 131.89],
        status: '运营中',
        description: '专业开发商「TSD」——远东业务总部。',
        image: '/images/vladivostok.webp',
      },
    ],
  },

  company: {
    section: '公司',
    heading: '运输建设开发集团',
    lead: '专注于严酷气候地区施工的联邦级开发商。',
    body: [
      '集团承担开发商与总承包商职能：住宅综合体与住宅区、社会与商业设施、工业与民用建筑、工程基础设施及景观建设。',
      '工作与国家保障性住房计划以及北极和远东开发机构协同开展。',
    ],
    timeline: [
      { year: '2008', title: '起步', body: '集团开始从事建筑承包业务。' },
      {
        year: '2022',
        title: '符拉迪沃斯托克',
        body: '注册专业开发商「TSD」——集团远东业务板块。',
      },
      {
        year: '2024',
        title: '北极',
        body: '在阿尔汉格尔斯克和摩尔曼斯克设立北极住宅项目公司。',
      },
      { year: '2025', title: '外贝加尔', body: '赤塔业务板块「TSD 发展」启动。' },
    ],
  },

  press: {
    section: '演讲',
    heading: '公开立场',
    lead: '叶夫根尼·库尼茨基在行业论坛上就艰难地区的开发议题发表演讲。',
    items: [
      {
        date: '2025.11.27',
        event: '远东建设论坛',
        place: '符拉迪沃斯托克',
        topic: '远东地区投资项目的实施',
      },
    ],
  },

  contact: {
    section: '联系',
    heading: '直接联系',
    lead: '通过即时通讯软件联系最快。',
    telegram: 'Telegram',
    whatsapp: 'WhatsApp',
    max: 'MAX',
    office: '办公室',
    officeAddress: '符拉迪沃斯托克，第聂伯罗夫斯卡娅街 107 号 4 室',
    company: '运输建设开发有限公司',
  },

  footer: {
    rights: '版权所有',
    disclaimer: '项目信息仅供参考，不构成公开要约。',
  },

  ui: {
    sound: '声音',
    soundOn: '开',
    soundOff: '关',
    langLabel: '语言',
  },
};

export default zh;
