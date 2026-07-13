/**
 * 从 /Users/liushuai/Desktop/bookmarks_2026_7_13.html 整理出的设计网站书签。
 * 原始书签保留在桌面；此文件是项目运行时的稳定数据副本。
 */

export type IcdDesignBookmarkCategory =
  | '建筑与室内'
  | '设计媒体与奖项'
  | '作品与灵感平台'
  | '材料、家具与产品'
  | 'UI、网页与动效'
  | '色彩、字体与设计工具'
  | '设计工具';

export interface IcdDesignBookmark {
  id: string;
  name: string;
  url: string;
  description: string;
  category: IcdDesignBookmarkCategory;
  tags: string[];
  note?: string;
  imageUrl: string;
  faviconUrl: string;
  isFavorite: boolean;
  isPreset: boolean;
  createdAt: number;
}

export const ICD_DESIGN_BOOKMARKS: IcdDesignBookmark[] = [
  {
    id: "bookmark-1",
    name: "Best Interior Design Company in Dubai. UAE - 4SPACE",
    url: "https://4space.ae/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "建筑与室内",
    tags: [
      "建筑与室内",
      "4space.ae"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2F4space.ae%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=4space.ae&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-2",
    name: "ArchDaily | 传播世界建筑",
    url: "https://www.archdaily.cn/cn",
    description: "设计灵感网站，来自本地书签归档。",
    category: "建筑与室内",
    tags: [
      "建筑与室内",
      "archdaily.cn"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.archdaily.cn%2Fcn?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=archdaily.cn&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-3",
    name: "ArchDaily | Broadcasting Architecture Worldwide",
    url: "https://www.archdaily.com/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "建筑与室内",
    tags: [
      "建筑与室内",
      "archdaily.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.archdaily.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=archdaily.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-4",
    name: "Archiproducts - 家具、设计和照明类产品",
    url: "https://www.archiproducts.com/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "材料、家具与产品",
    tags: [
      "材料、家具与产品",
      "archiproducts.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.archiproducts.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=archiproducts.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-5",
    name: "ArtStation - All Channels",
    url: "https://www.artstation.com/?sort_by=community&dimension=all",
    description: "设计灵感网站，来自本地书签归档。",
    category: "作品与灵感平台",
    tags: [
      "作品与灵感平台",
      "artstation.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.artstation.com%2F%3Fsort_by%3Dcommunity%26dimension%3Dall?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=artstation.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-6",
    name: "Architecture 项目 | Behance 上的照片、视频、徽标、插图和品牌",
    url: "https://www.behance.net/search/projects?field=architecture",
    description: "设计灵感网站，来自本地书签归档。",
    category: "建筑与室内",
    tags: [
      "建筑与室内",
      "behance.net"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.behance.net%2Fsearch%2Fprojects%3Ffield%3Darchitecture?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=behance.net&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-7",
    name: "Behance :: 给你",
    url: "https://www.behance.net/?locale=en-US",
    description: "设计灵感网站，来自本地书签归档。",
    category: "作品与灵感平台",
    tags: [
      "作品与灵感平台",
      "behance.net"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.behance.net%2F%3Flocale%3Den-US?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=behance.net&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-8",
    name: "大 | 比亚克英格尔斯集团",
    url: "https://big.dk/#projects",
    description: "设计灵感网站，来自本地书签归档。",
    category: "建筑与室内",
    tags: [
      "建筑与室内",
      "big.dk"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fbig.dk%2F%23projects?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=big.dk&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-9",
    name: "奖项 | Campaign Asia",
    url: "https://www.campaignasia.com/Topic/awards/497260",
    description: "设计灵感网站，来自本地书签归档。",
    category: "设计媒体与奖项",
    tags: [
      "设计媒体与奖项",
      "campaignasia.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.campaignasia.com%2FTopic%2Fawards%2F497260?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=campaignasia.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-10",
    name: "Color palette generator | Canva Colors",
    url: "https://www.canva.com/colors/color-palette-generator/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "色彩、字体与设计工具",
    tags: [
      "色彩、字体与设计工具",
      "canva.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.canva.com%2Fcolors%2Fcolor-palette-generator%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=canva.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-11",
    name: "首页 - Canva可画",
    url: "https://www.canva.com/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "canva.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.canva.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=canva.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-12",
    name: "全球第一-CCD 鄭中設計事務所（HK）",
    url: "http://www.ccd.com.hk/work",
    description: "设计灵感网站，来自本地书签归档。",
    category: "建筑与室内",
    tags: [
      "建筑与室内",
      "ccd.com.hk"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/http%3A%2F%2Fwww.ccd.com.hk%2Fwork?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=ccd.com.hk&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-13",
    name: "色輪、調色盤產生器 | Adobe Color",
    url: "https://color.adobe.com/zh/create/color-wheel/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "色彩、字体与设计工具",
    tags: [
      "色彩、字体与设计工具",
      "color.adobe.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fcolor.adobe.com%2Fzh%2Fcreate%2Fcolor-wheel%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=color.adobe.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-14",
    name: "Color Palettes for Designers and Artists - Color Hunt",
    url: "https://colorhunt.co/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "色彩、字体与设计工具",
    tags: [
      "色彩、字体与设计工具",
      "colorhunt.co"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fcolorhunt.co%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=colorhunt.co&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-15",
    name: "designboom magazine | your first source for architecture, design & art news",
    url: "https://www.designboom.com/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "建筑与室内",
    tags: [
      "建筑与室内",
      "designboom.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.designboom.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=designboom.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-16",
    name: "FREE DIGITAL ASSETS MANAGEMENT FOR 3D ARTISTS",
    url: "https://www.designconnected.com/connecter",
    description: "设计灵感网站，来自本地书签归档。",
    category: "材料、家具与产品",
    tags: [
      "材料、家具与产品",
      "designconnected.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.designconnected.com%2Fconnecter?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=designconnected.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-17",
    name: "设计纪元 | 设计报奖第一站",
    url: "https://dev.designepoch.com.cn/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "设计媒体与奖项",
    tags: [
      "设计媒体与奖项",
      "dev.designepoch.com.cn"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fdev.designepoch.com.cn%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=dev.designepoch.com.cn&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-18",
    name: "德国室内设计dinzd.com",
    url: "http://www.dinzd.com/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "建筑与室内",
    tags: [
      "建筑与室内",
      "dinzd.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/http%3A%2F%2Fwww.dinzd.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=dinzd.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-19",
    name: "字体天下-提供各类字体的免费下载和在线预览服务",
    url: "https://www.fonts.net.cn/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "色彩、字体与设计工具",
    tags: [
      "色彩、字体与设计工具",
      "fonts.net.cn"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.fonts.net.cn%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=fonts.net.cn&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-20",
    name: "谷德设计网",
    url: "https://www.gooood.cn/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "建筑与室内",
    tags: [
      "建筑与室内",
      "gooood.cn"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.gooood.cn%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=gooood.cn&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-21",
    name: "古田路9号-品牌创意/版权保护平台",
    url: "https://www.gtn9.com/index.aspx",
    description: "设计灵感网站，来自本地书签归档。",
    category: "设计媒体与奖项",
    tags: [
      "设计媒体与奖项",
      "gtn9.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.gtn9.com%2Findex.aspx?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=gtn9.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-22",
    name: "广州设计周 在报奖项",
    url: "https://gzdw.designepoch.com.cn/detail/50",
    description: "设计灵感网站，来自本地书签归档。",
    category: "设计媒体与奖项",
    tags: [
      "设计媒体与奖项",
      "gzdw.designepoch.com.cn"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fgzdw.designepoch.com.cn%2Fdetail%2F50?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=gzdw.designepoch.com.cn&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-23",
    name: "艾特奖官网—艾特奖(IDEA-TOPS)官方网站",
    url: "https://www.idea-tops.com/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "设计媒体与奖项",
    tags: [
      "设计媒体与奖项",
      "idea-tops.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.idea-tops.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=idea-tops.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-24",
    name: "lifetime - Sandra Ohlendorf",
    url: "https://www.lifetimeinterior.de/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "建筑与室内",
    tags: [
      "建筑与室内",
      "lifetimeinterior.de"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.lifetimeinterior.de%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=lifetimeinterior.de&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-25",
    name: "设计风向-〡探知全球最新设计风向，为中国新设计力量、中国创意赋能",
    url: "https://loftcn.com/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "设计媒体与奖项",
    tags: [
      "设计媒体与奖项",
      "loftcn.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Floftcn.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=loftcn.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-26",
    name: "标志情报局 - 全球LOGO新闻和品牌设计趋势平台",
    url: "https://www.logonews.cn/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "设计媒体与奖项",
    tags: [
      "设计媒体与奖项",
      "logonews.cn"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.logonews.cn%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=logonews.cn&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-27",
    name: "Discover iOS apps | Mobbin",
    url: "https://mobbin.com/discover/apps/ios/latest",
    description: "设计灵感网站，来自本地书签归档。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "mobbin.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fmobbin.com%2Fdiscover%2Fapps%2Fios%2Flatest?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=mobbin.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-28",
    name: "NIPPON COLORS - 日本の伝統色",
    url: "http://nipponcolors.com/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "色彩、字体与设计工具",
    tags: [
      "色彩、字体与设计工具",
      "nipponcolors.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/http%3A%2F%2Fnipponcolors.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=nipponcolors.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-29",
    name: "Paletton - The Color Scheme Designer",
    url: "https://paletton.com/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "色彩、字体与设计工具",
    tags: [
      "色彩、字体与设计工具",
      "paletton.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fpaletton.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=paletton.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-30",
    name: "(50) Pinterest",
    url: "https://www.pinterest.com/search/pins/?q=Brand%20VI%20system&rs=typed",
    description: "设计灵感网站，来自本地书签归档。",
    category: "作品与灵感平台",
    tags: [
      "作品与灵感平台",
      "pinterest.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.pinterest.com%2Fsearch%2Fpins%2F%3Fq%3DBrand%2520VI%2520system%26rs%3Dtyped?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=pinterest.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-31",
    name: "Pinterest",
    url: "https://www.pinterest.com/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "作品与灵感平台",
    tags: [
      "作品与灵感平台",
      "pinterest.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.pinterest.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=pinterest.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-32",
    name: "立邦漆色彩查询页电子版1988色 - 色彩目录 - 千通彩色库",
    url: "https://www.qtccolor.com/secaiku/dir/28",
    description: "设计灵感网站，来自本地书签归档。",
    category: "色彩、字体与设计工具",
    tags: [
      "色彩、字体与设计工具",
      "qtccolor.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.qtccolor.com%2Fsecaiku%2Fdir%2F28?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=qtccolor.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-33",
    name: "ReflexDesign 条件反射设计官方网站",
    url: "http://www.reflexdesign.cn/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "建筑与室内",
    tags: [
      "建筑与室内",
      "reflexdesign.cn"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/http%3A%2F%2Fwww.reflexdesign.cn%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=reflexdesign.cn&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-34",
    name: "SD-PPP - Photoshop AI 插件 | SD-PPP",
    url: "https://sdppp.zombee.tech/zh/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "设计工具",
    tags: [
      "设计工具",
      "sdppp.zombee.tech"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fsdppp.zombee.tech%2Fzh%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=sdppp.zombee.tech&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-35",
    name: "Seeseed-无穷尽设计可能",
    url: "https://www.seeseed.com/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "建筑与室内",
    tags: [
      "建筑与室内",
      "seeseed.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.seeseed.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=seeseed.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-36",
    name: "3D 设计软件 | Web 上的 3D 建模 | 草图",
    url: "https://sketchup.com/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "材料、家具与产品",
    tags: [
      "材料、家具与产品",
      "sketchup.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fsketchup.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=sketchup.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-37",
    name: "Refero Styles",
    url: "https://styles.refero.design/?sort=popular&q=minimal+design",
    description: "设计灵感网站，来自本地书签归档。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "styles.refero.design"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fstyles.refero.design%2F%3Fsort%3Dpopular%26q%3Dminimal%2Bdesign?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=styles.refero.design&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-38",
    name: "Substance 成为 Adob​​e Substance 3D",
    url: "https://www.substance3d.com/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "材料、家具与产品",
    tags: [
      "材料、家具与产品",
      "substance3d.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.substance3d.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=substance3d.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-39",
    name: "Thea Render – Versatile Renderer",
    url: "https://www.thearender.com/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "材料、家具与产品",
    tags: [
      "材料、家具与产品",
      "thearender.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.thearender.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=thearender.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-40",
    name: "Thingiverse - Digital Designs for Physical Objects",
    url: "https://www.thingiverse.com/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "材料、家具与产品",
    tags: [
      "材料、家具与产品",
      "thingiverse.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.thingiverse.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=thingiverse.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-41",
    name: "【新提醒】LS刘帅的空间 - 拓者设计吧",
    url: "https://www.tuozhe8.com/space-uid-3029205.html",
    description: "设计灵感网站，来自本地书签归档。",
    category: "建筑与室内",
    tags: [
      "建筑与室内",
      "tuozhe8.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.tuozhe8.com%2Fspace-uid-3029205.html?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=tuozhe8.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-42",
    name: "uiGradients - Beautiful colored gradients",
    url: "https://uigradients.com/#Hydrogen",
    description: "设计灵感网站，来自本地书签归档。",
    category: "色彩、字体与设计工具",
    tags: [
      "色彩、字体与设计工具",
      "uigradients.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fuigradients.com%2F%23Hydrogen?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=uigradients.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-43",
    name: "Brand New",
    url: "https://www.underconsideration.com/brandnew/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "设计媒体与奖项",
    tags: [
      "设计媒体与奖项",
      "underconsideration.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.underconsideration.com%2Fbrandnew%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=underconsideration.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-44",
    name: "Architecture & Interiors | Unsplash",
    url: "https://unsplash.com/t/architecture-interior",
    description: "设计灵感网站，来自本地书签归档。",
    category: "建筑与室内",
    tags: [
      "建筑与室内",
      "unsplash.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Funsplash.com%2Ft%2Farchitecture-interior?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=unsplash.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-45",
    name: "作品-心铭舍 -",
    url: "http://www.xinming.sg/projects/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "建筑与室内",
    tags: [
      "建筑与室内",
      "xinming.sg"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/http%3A%2F%2Fwww.xinming.sg%2Fprojects%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=xinming.sg&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-46",
    name: "脚本插件 – 研几CG",
    url: "https://yanjicg.com/product-category/plugins/page/4",
    description: "设计灵感网站，来自本地书签归档。",
    category: "材料、家具与产品",
    tags: [
      "材料、家具与产品",
      "yanjicg.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fyanjicg.com%2Fproduct-category%2Fplugins%2Fpage%2F4?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=yanjicg.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-47",
    name: "档案馆 – 扎哈·哈迪德建筑师事务所",
    url: "https://www.zaha-hadid.com/archive",
    description: "设计灵感网站，来自本地书签归档。",
    category: "建筑与室内",
    tags: [
      "建筑与室内",
      "zaha-hadid.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.zaha-hadid.com%2Farchive?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=zaha-hadid.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-48",
    name: "站酷ZCOOL-设计师互动平台-打开站酷，发现更好的设计！",
    url: "https://www.zcool.com.cn/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "作品与灵感平台",
    tags: [
      "作品与灵感平台",
      "zcool.com.cn"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.zcool.com.cn%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=zcool.com.cn&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-49",
    name: "大豆黄 - 中国色 - 中国传统颜色",
    url: "https://www.zhongguose.com/#dadouhuang",
    description: "设计灵感网站，来自本地书签归档。",
    category: "色彩、字体与设计工具",
    tags: [
      "色彩、字体与设计工具",
      "zhongguose.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.zhongguose.com%2F%23dadouhuang?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=zhongguose.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-50",
    name: "Muzli - 设计灵感中心",
    url: "https://muz.li/cn/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "作品与灵感平台",
    tags: [
      "作品与灵感平台",
      "muz.li"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fmuz.li%2Fcn%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=muz.li&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-51",
    name: "HKS | Architects & Designers",
    url: "https://www.hksinc.com/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "建筑与室内",
    tags: [
      "建筑与室内",
      "hksinc.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.hksinc.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=hksinc.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-52",
    name: "Yanko Design - Modern Industrial Design News",
    url: "https://www.yankodesign.com/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "设计媒体与奖项",
    tags: [
      "设计媒体与奖项",
      "yankodesign.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.yankodesign.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=yankodesign.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-53",
    name: "展示、发现和聘用创意人员 :: Behance",
    url: "https://www.behance.net/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "作品与灵感平台",
    tags: [
      "作品与灵感平台",
      "behance.net"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.behance.net%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=behance.net&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-54",
    name: "Our Design Approach | Yabu Pushelberg",
    url: "https://www.yabupushelberg.com/approach",
    description: "设计灵感网站，来自本地书签归档。",
    category: "建筑与室内",
    tags: [
      "建筑与室内",
      "yabupushelberg.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.yabupushelberg.com%2Fapproach?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=yabupushelberg.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-55",
    name: "Neri&Hu",
    url: "https://neriandhu.com/zn",
    description: "设计灵感网站，来自本地书签归档。",
    category: "建筑与室内",
    tags: [
      "建筑与室内",
      "neriandhu.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fneriandhu.com%2Fzn?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=neriandhu.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-56",
    name: "Norm Architects | Designing architecture, interiors and products",
    url: "https://normcph.com/?utm_source=chatgpt.com",
    description: "设计灵感网站，来自本地书签归档。",
    category: "建筑与室内",
    tags: [
      "建筑与室内",
      "normcph.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fnormcph.com%2F%3Futm_source%3Dchatgpt.com?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=normcph.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-57",
    name: "Project Page - Awwwards",
    url: "https://www.awwwards.com/awwwards/collections/project-page/?utm_source=chatgpt.com",
    description: "设计灵感网站，来自本地书签归档。",
    category: "设计媒体与奖项",
    tags: [
      "设计媒体与奖项",
      "awwwards.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.awwwards.com%2Fawwwards%2Fcollections%2Fproject-page%2F%3Futm_source%3Dchatgpt.com?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=awwwards.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-58",
    name: "建筑|住宅 |比亚克英格斯集团",
    url: "https://big.dk/projects/architecture/residential",
    description: "设计灵感网站，来自本地书签归档。",
    category: "建筑与室内",
    tags: [
      "建筑与室内",
      "big.dk"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fbig.dk%2Fprojects%2Farchitecture%2Fresidential?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=big.dk&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-59",
    name: "CL3",
    url: "https://www.cl3.com/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "建筑与室内",
    tags: [
      "建筑与室内",
      "cl3.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.cl3.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=cl3.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-60",
    name: "为瑞幸咖啡打造全球化品牌新IP - RONG Design",
    url: "https://www.rong-design.com/catering/luckincoffee-lucky",
    description: "设计灵感网站，来自本地书签归档。",
    category: "建筑与室内",
    tags: [
      "建筑与室内",
      "rong-design.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.rong-design.com%2Fcatering%2Fluckincoffee-lucky?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=rong-design.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-61",
    name: "总规设计_商业建筑设计_总体规划-J&A杰恩设计",
    url: "https://jaid.cn/service/795.html",
    description: "设计灵感网站，来自本地书签归档。",
    category: "建筑与室内",
    tags: [
      "建筑与室内",
      "jaid.cn"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fjaid.cn%2Fservice%2F795.html?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=jaid.cn&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-62",
    name: "Matrix Design矩阵纵横-矩阵纵横设计股份有限公司-兼具业界影响力和当代代表性的中国设计品牌",
    url: "https://www.matrixdesign.com/timeline?versionFlag=0",
    description: "设计灵感网站，来自本地书签归档。",
    category: "建筑与室内",
    tags: [
      "建筑与室内",
      "matrixdesign.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.matrixdesign.com%2Ftimeline%3FversionFlag%3D0?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=matrixdesign.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-63",
    name: "Figma: The Collaborative Interface Design Tool",
    url: "https://www.figma.com/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "figma.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.figma.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=figma.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-64",
    name: "React Bits - Animated UI Components For React",
    url: "https://reactbits.dev/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "reactbits.dev"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Freactbits.dev%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=reactbits.dev&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-65",
    name: "Unicorn Studio — No-code WebGL Tool",
    url: "https://www.unicorn.studio/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "unicorn.studio"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.unicorn.studio%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=unicorn.studio&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-66",
    name: "Freepik 现已是 Magnific",
    url: "https://www.magnific.com/cn/freepik#from_element=topbar_banner",
    description: "设计灵感网站，来自本地书签归档。",
    category: "材料、家具与产品",
    tags: [
      "材料、家具与产品",
      "magnific.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.magnific.com%2Fcn%2Ffreepik%23from_element%3Dtopbar_banner?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=magnific.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-67",
    name: "Matrix Design矩阵纵横-矩阵纵横设计股份有限公司-兼具业界影响力和当代代表性的中国设计品牌",
    url: "https://www.matrixdesign.com/mobile/home?versionFlag=0",
    description: "设计灵感网站，来自本地书签归档。",
    category: "建筑与室内",
    tags: [
      "建筑与室内",
      "matrixdesign.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.matrixdesign.com%2Fmobile%2Fhome%3FversionFlag%3D0?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=matrixdesign.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-68",
    name: "Tailwind CSS 颜色 - 所有颜色 + 自定义颜色生成器",
    url: "https://uicolors.app/generate/910db0",
    description: "设计灵感网站，来自本地书签归档。",
    category: "色彩、字体与设计工具",
    tags: [
      "色彩、字体与设计工具",
      "uicolors.app"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fuicolors.app%2Fgenerate%2F910db0?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=uicolors.app&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-69",
    name: "DESIGN.md AI 代理示例 | Refero Styles",
    url: "https://styles.refero.design/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "styles.refero.design"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fstyles.refero.design%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=styles.refero.design&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-70",
    name: "Gucci：谜团揭晓 - Awwwards SOTD",
    url: "https://www.awwwards.com/sites/gucci-mystery-unfolds",
    description: "设计灵感网站，来自本地书签归档。",
    category: "设计媒体与奖项",
    tags: [
      "设计媒体与奖项",
      "awwwards.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.awwwards.com%2Fsites%2Fgucci-mystery-unfolds?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=awwwards.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-71",
    name: "Recent — Design Inspiration",
    url: "https://recent.design/",
    description: "设计灵感网站，来自本地书签归档。",
    category: "作品与灵感平台",
    tags: [
      "作品与灵感平台",
      "recent.design"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Frecent.design%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=recent.design&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-72",
    name: "Aceternity UI",
    url: "https://ui.aceternity.com/",
    description: "视觉参考书签，适合快速浏览界面、动效与网站案例。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "ui.aceternity.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fui.aceternity.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=ui.aceternity.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-73",
    name: "Magic UI",
    url: "https://magicui.design/",
    description: "视觉参考书签，适合快速浏览界面、动效与网站案例。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "magicui.design"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fmagicui.design%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=magicui.design&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-74",
    name: "Motion Primitives",
    url: "https://motion-primitives.com/",
    description: "视觉参考书签，适合快速浏览界面、动效与网站案例。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "motion-primitives.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fmotion-primitives.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=motion-primitives.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-75",
    name: "Animate UI",
    url: "https://animate-ui.com/",
    description: "视觉参考书签，适合快速浏览界面、动效与网站案例。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "animate-ui.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fanimate-ui.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=animate-ui.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-76",
    name: "Smooth UI",
    url: "https://smoothui.dev/",
    description: "视觉参考书签，适合快速浏览界面、动效与网站案例。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "smoothui.dev"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fsmoothui.dev%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=smoothui.dev&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-77",
    name: "Hover.dev",
    url: "https://www.hover.dev/",
    description: "视觉参考书签，适合快速浏览界面、动效与网站案例。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "hover.dev"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.hover.dev%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=hover.dev&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-78",
    name: "Cult UI",
    url: "https://www.cult-ui.com/",
    description: "视觉参考书签，适合快速浏览界面、动效与网站案例。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "cult-ui.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.cult-ui.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=cult-ui.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-79",
    name: "shadcn/ui",
    url: "https://ui.shadcn.com/",
    description: "视觉参考书签，适合快速浏览界面、动效与网站案例。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "ui.shadcn.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fui.shadcn.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=ui.shadcn.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-80",
    name: "Tailwind Plus",
    url: "https://tailwindcss.com/plus/ui-blocks",
    description: "视觉参考书签，适合快速浏览界面、动效与网站案例。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "tailwindcss.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Ftailwindcss.com%2Fplus%2Fui-blocks?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=tailwindcss.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-81",
    name: "Flowbite React",
    url: "https://flowbite-react.com/",
    description: "视觉参考书签，适合快速浏览界面、动效与网站案例。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "flowbite-react.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fflowbite-react.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=flowbite-react.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-82",
    name: "Flowbite",
    url: "https://flowbite.com/",
    description: "视觉参考书签，适合快速浏览界面、动效与网站案例。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "flowbite.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fflowbite.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=flowbite.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-83",
    name: "Origin UI",
    url: "https://originui.com/",
    description: "视觉参考书签，适合快速浏览界面、动效与网站案例。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "originui.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Foriginui.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=originui.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-84",
    name: "Kibo UI",
    url: "https://www.kibo-ui.com/",
    description: "视觉参考书签，适合快速浏览界面、动效与网站案例。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "kibo-ui.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.kibo-ui.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=kibo-ui.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-85",
    name: "21st.dev",
    url: "https://21st.dev/",
    description: "视觉参考书签，适合快速浏览界面、动效与网站案例。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "21st.dev"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2F21st.dev%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=21st.dev&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-86",
    name: "Awwwards Animation",
    url: "https://www.awwwards.com/websites/animation/",
    description: "视觉参考书签，适合快速浏览界面、动效与网站案例。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "awwwards.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.awwwards.com%2Fwebsites%2Fanimation%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=awwwards.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-87",
    name: "Godly",
    url: "https://godly.website/",
    description: "视觉参考书签，适合快速浏览界面、动效与网站案例。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "godly.website"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fgodly.website%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=godly.website&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-88",
    name: "Land-book",
    url: "https://land-book.com/",
    description: "视觉参考书签，适合快速浏览界面、动效与网站案例。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "land-book.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fland-book.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=land-book.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-89",
    name: "Lapa Ninja",
    url: "https://www.lapa.ninja/",
    description: "视觉参考书签，适合快速浏览界面、动效与网站案例。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "lapa.ninja"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.lapa.ninja%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=lapa.ninja&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-90",
    name: "Minimal Gallery",
    url: "https://minimal.gallery/",
    description: "视觉参考书签，适合快速浏览界面、动效与网站案例。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "minimal.gallery"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fminimal.gallery%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=minimal.gallery&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-91",
    name: "Siteinspire",
    url: "https://www.siteinspire.com/",
    description: "视觉参考书签，适合快速浏览界面、动效与网站案例。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "siteinspire.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.siteinspire.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=siteinspire.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-92",
    name: "Httpster",
    url: "https://httpster.net/",
    description: "视觉参考书签，适合快速浏览界面、动效与网站案例。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "httpster.net"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fhttpster.net%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=httpster.net&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-93",
    name: "Admire The Web",
    url: "https://www.admiretheweb.com/",
    description: "视觉参考书签，适合快速浏览界面、动效与网站案例。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "admiretheweb.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.admiretheweb.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=admiretheweb.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-94",
    name: "Mobbin",
    url: "https://mobbin.com/",
    description: "视觉参考书签，适合快速浏览界面、动效与网站案例。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "mobbin.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fmobbin.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=mobbin.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-95",
    name: "Pageflows",
    url: "https://pageflows.com/",
    description: "视觉参考书签，适合快速浏览界面、动效与网站案例。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "pageflows.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fpageflows.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=pageflows.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-96",
    name: "UI Sources",
    url: "https://www.uisources.com/",
    description: "视觉参考书签，适合快速浏览界面、动效与网站案例。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "uisources.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fwww.uisources.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=uisources.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-97",
    name: "SaaS Landing Page",
    url: "https://saaslandingpage.com/",
    description: "视觉参考书签，适合快速浏览界面、动效与网站案例。",
    category: "UI、网页与动效",
    tags: [
      "UI、网页与动效",
      "saaslandingpage.com"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fsaaslandingpage.com%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=saaslandingpage.com&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  },
  {
    id: "bookmark-98",
    name: "Flipbook",
    url: "https://flipbook.page/",
    description: "视觉参考书签，适合快速浏览界面、动效与网站案例。",
    category: "设计工具",
    tags: [
      "设计工具",
      "flipbook.page"
    ],
    imageUrl: "https://s.wordpress.com/mshots/v1/https%3A%2F%2Fflipbook.page%2F?w=900",
    faviconUrl: "https://www.google.com/s2/favicons?domain=flipbook.page&sz=128",
    isFavorite: false,
    isPreset: true,
    createdAt: 0
  }
];
