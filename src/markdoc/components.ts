import * as React from 'react'

import { Accordion, Accordions } from '@/components/Accordion'
import { Banner } from '@/components/Banner'
import { Callout } from '@/components/Callout'
import { Card, Cards } from '@/components/Cards'
import { CodeTab, CodeTabs } from '@/components/CodeTabs'
import { Fence } from '@/components/Fence'
import { File, Files, Folder } from '@/components/Files'
import { Heading } from '@/components/Heading'
import { MarkdocLink } from '@/components/MarkdocLink'
import { QuickLink, QuickLinks } from '@/components/QuickLinks'
import { Step, Steps } from '@/components/Steps'
import { Tab, Tabs } from '@/components/Tabs'
import { ZoomableImage } from '@/components/ZoomableImage'

// Map of Markdoc render names to React components. Every entry here must
// have a matching `render: '<Name>'` in `src/markdoc/tags.js` or
// `src/markdoc/nodes.js`. Add a new surface? Import this module; the
// component set is the same across docs / changelog / future surfaces.
export const components = {
  Accordion,
  Accordions,
  Banner,
  Callout,
  Card,
  Cards,
  CodeTab,
  CodeTabs,
  Fence,
  File,
  Files,
  Folder,
  Fragment: React.Fragment,
  Heading,
  MarkdocLink,
  QuickLink,
  QuickLinks,
  Step,
  Steps,
  Tab,
  Tabs,
  ZoomableImage,
}
