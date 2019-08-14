// @flow
/*
    Pillar Wallet: the personal data locker
    Copyright (C) 2019 Stiftung Pillar Project

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/
import { responsiveSize } from 'utils/ui';

export const baseColors = {
  sunYellow: '#f8e71c',
  burningFire: '#F56C07',
  periwinkle: '#9191ff',
  fireEngineRed: '#ff0005',
  warmPurple: '#b2329c',
  brightPurple: '#4f1a91',
  electricBlue: '#007AFF',
  electricBlueIntense: '#2329d6',
  duckEggBlue: '#e6eefa',
  selago: '#f6fafe',
  hawkesBlue: '#f0f7fe',
  brightSkyBlue: '#00bfff',
  pigeonPost: '#9fb7db',
  cyan: '#00bfff',
  aquaMarine: '#50e3c2',
  freshEucalyptus: '#2AA057',
  snowWhite: '#fafafa',
  lightGray: '#f5f5f5',
  whiteSmoke: '#f7f7f7',
  whiterSmoke: '#f2f2f2',
  lighterGray: '#fafafa',
  mediumGray: '#C6CACD',
  mediumLightGray: '#EDEDED',
  darkGray: '#8B939E',
  coolGrey: '#8b939e',
  slateBlack: '#0A1427',
  lightGreen: '#82bc40',
  jadeGreen: '#2aa157',
  clearBlue: '#2077fd',
  offBlue: '#5983b0',
  white: '#ffffff',
  black: '#000000',
  vividOrange: '#ffc021',
  brightBlue: '#2f86eb',
  limeGreen: '#47d764',
  lightYellow: '#feffe0',
  gallery: '#efefef',
  veryLightBlue: '#e0edff',
  dawnPink: '#f2eae4',
  rose: '#f5078d',
  cerulean: '#07b0f5',
  beige: '#f7f7df',
  coconutCream: '#e3e3bd',
  pineGlade: '#b3b375',
  mantis: '#85bb4c',
  oliveDrab: '#5e9226',
  alabaster: '#fcfcfc',
  aliceBlue: '#f7fbff',
  manatee: '#a3a9b2',
  blanchedAlmond: '#ffe8ce',
  geyser: '#d1d7dd',
  fairPink: '#f7ebe6',
  tumbleweed: '#db9a84',
  pattensBlue: '#F0F5FA',
  shark: '#292c33',
  caribbeanGreen: '#4cf18b',
  royalBlue: '#4588de',
  blumine: '#275692',
  emerald: '#3dd276',
  greyser: '#d1d9e4',
  midnight: '#222e44',
  eucalypus: '#2aa057',
  tropicalBlue: '#CAE1F8',
  zumthor: '#EBF5FF',
  fruitSalad: '#459d53',
  lavenderBlue: '#c3e0ff',
  hoki: '#647fa4',
  deepSkyBlue: '#01BFFF',
  blueViolet: '#b233e4',
  ultramarine: '#0a0c78',
  pomegranate: '#f33726',
  aluminium: '#a9aeb8',
  dell: '#467038',
  stratos: '#000260',
  rockBlue: '#8e8fb8',
};

export const brandColors = [
  baseColors.periwinkle,
  baseColors.sunYellow,
  baseColors.burningFire,
  baseColors.brightSkyBlue,
  baseColors.aquaMarine,
];

export const UIColors = {
  primary: baseColors.electricBlue,
  danger: baseColors.burningFire,
  disabled: baseColors.mediumGray,
  defaultHeaderColor: baseColors.white,
  defaultInputBackgroundColor: baseColors.white,
  defaultTextColor: baseColors.slateBlack,
  defaultNavigationColor: baseColors.slateBlack,
  defaultBackgroundColor: baseColors.snowWhite,
  defaultBorderColor: 'rgba(0, 0, 0, 0.085)',
  focusedBorderColor: baseColors.electricBlue,
  defaultShadowColor: 'rgba(0, 0, 0, 0.25)',
  tabShadowColor: 'rgba(128, 128, 128, 0.2)',
  placeholderTextColor: baseColors.darkGray,
  cardShadowColor: '#EEF3F9',
  actionButtonShadowColor: 'rgba(18, 63, 111, 0.1)',
  defaultDividerColor: baseColors.mediumLightGray,
  actionButtonBorderColor: 'rgba(255, 255, 255, 0.37)',
};

export const fontSizes = {
  tiny: 10,
  extraExtraSmall: 12,
  extraSmall: 14,
  small: 16,
  medium: 18,
  mediumLarge: 20,
  large: 22,
  extraLarge: 24,
  extraLarger: 28,
  extraExtraLarge: 32,
  semiGiant: 34,
  giant: 36,
  extraGiant: 48,
  iosIcons: 32,
  androidCloseIcon: 22,
  androidCheckmarkIcon: 26,
  rJumbo: responsiveSize(64),
  rMedium: responsiveSize(17),
};

export const spacing = {
  rhythm: 20,
  small: 8,
  medium: 12,
  mediumLarge: 16,
  large: 20,
};

export const itemSizes = {
  avatarCircleSmall: 44,
  avatarCircleMedium: 54,
};

export const fontTrackings = {
  tiny: 0.1,
  small: 0.2,
  medium: 0.3,
  mediumLarge: 0.4,
  large: 0.5,
};

export const fontWeights = {
  thin: '100',
  light: '300',
  book: '400',
  medium: '500',
  bold: '700',
  black: '900',
};
