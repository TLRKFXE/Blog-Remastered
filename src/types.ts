export interface PostFrontmatter {
  title: string
  date: string
  lang?: string
  duration?: string
  description?: string
  subtitle?: string
  draft?: boolean
  image?: string
}

export interface ProjectItem {
  name: string
  description: string
  link: string
  icon?: string
}
