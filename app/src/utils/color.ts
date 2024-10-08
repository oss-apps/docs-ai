import tinycolor from 'tinycolor2';

export const getContrastColor = (bgColor: string) => {
  if (bgColor === '#000') return '#fff'
  if (bgColor.length != 7 && bgColor.length != 4) return '#000'
  const textColorPallete = ["#000", "#fff"]
  const contrastColor = tinycolor.mostReadable(bgColor, textColorPallete);
  return contrastColor.toHexString();
}