import { Tag } from '@markdoc/markdoc'

const tags = {
  tabs: {
    render: 'Tabs',
  },
  tab: {
    render: 'Tab',
    attributes: {
      label: { type: String, required: true },
    },
  },
  'code-tabs': {
    render: 'CodeTabs',
  },
  'code-tab': {
    render: 'CodeTab',
    attributes: {
      label: { type: String, required: true },
    },
    // Extract the raw fence source (code + language) directly from the AST
    // so the async CodeTabs server component can pre-highlight via Shiki.
    // Without this, Markdoc would render the fence child as a normal <Fence>
    // and we'd lose access to the raw string.
    transform(node, config) {
      let attrs = node.transformAttributes(config)
      let fence = (node.children || []).find((c) => c.type === 'fence')
      let code = fence?.attributes?.content ?? ''
      let language = fence?.attributes?.language ?? 'text'
      return new Tag('CodeTab', { label: attrs.label, code, language })
    },
  },
  steps: {
    render: 'Steps',
  },
  step: {
    render: 'Step',
    attributes: {
      title: { type: String },
    },
  },
  cards: {
    render: 'Cards',
  },
  card: {
    render: 'Card',
    attributes: {
      title: { type: String, required: true },
      description: { type: String },
      href: { type: String },
      icon: { type: String },
    },
  },
  accordions: {
    render: 'Accordions',
  },
  accordion: {
    render: 'Accordion',
    attributes: {
      title: { type: String, required: true },
    },
  },
  files: {
    render: 'Files',
  },
  folder: {
    render: 'Folder',
    attributes: {
      name: { type: String, required: true },
    },
  },
  file: {
    render: 'File',
    selfClosing: true,
    attributes: {
      name: { type: String, required: true },
    },
  },
  banner: {
    render: 'Banner',
    attributes: {
      variant: {
        type: String,
        default: 'info',
        matches: ['info', 'warning', 'success', 'error'],
      },
      title: { type: String },
    },
  },
  callout: {
    attributes: {
      title: { type: String },
      type: {
        type: String,
        default: 'note',
        matches: ['note', 'warning'],
        errorLevel: 'critical',
      },
    },
    render: 'Callout',
  },
  figure: {
    selfClosing: true,
    attributes: {
      src: { type: String },
      alt: { type: String },
      caption: { type: String },
    },
    render: 'ZoomableImage',
  },
  'quick-links': {
    render: 'QuickLinks',
  },
  'quick-link': {
    selfClosing: true,
    render: 'QuickLink',
    attributes: {
      title: { type: String },
      description: { type: String },
      icon: { type: String },
      href: { type: String },
    },
  },
}

export default tags
