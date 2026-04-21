import { nodes as defaultNodes, Tag } from '@markdoc/markdoc'
import { slugifyWithCounter } from '@sindresorhus/slugify'

let documentSlugifyMap = new Map()

const nodes = {
  code: {
    ...defaultNodes.code,
    render: 'code',
    attributes: {
      inline: { type: Boolean, default: 'true' },
    },
  },
  document: {
    ...defaultNodes.document,
    render: 'Fragment',
    transform(node, config) {
      documentSlugifyMap.set(config, slugifyWithCounter())
      return new Tag('Fragment', {}, node.transformChildren(config))
    },
  },
  heading: {
    ...defaultNodes.heading,
    render: 'Heading',
    transform(node, config) {
      let slugify = documentSlugifyMap.get(config)
      let attributes = node.transformAttributes(config)
      let children = node.transformChildren(config)
      let text = children.filter((child) => typeof child === 'string').join(' ')
      let id = attributes.id ?? slugify(text)

      return new Tag('Heading', { level: node.attributes.level, id }, children)
    },
  },
  link: {
    ...defaultNodes.link,
    render: 'MarkdocLink',
  },
  th: {
    ...defaultNodes.th,
    attributes: {
      ...defaultNodes.th.attributes,
      scope: {
        type: String,
        default: 'col',
      },
    },
  },
  fence: {
    render: 'Fence',
    attributes: {
      language: { type: String },
      title: { type: String },
      lineNumbers: { type: Boolean },
    },
  },
}

export default nodes
