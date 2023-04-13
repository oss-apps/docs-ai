export const getLinkDirectory = (link: string) => {
  let actLink = link
  if (link.endsWith('/')) {
    actLink = link.substring(0, link.length - 1)
  }

  return actLink.substring(actLink.lastIndexOf('/'))
}
