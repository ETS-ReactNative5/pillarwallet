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
import * as React from 'react';
import { Dimensions, Platform, PixelRatio, View } from 'react-native';

export async function getDecimals(token) {
  const decimals = await token
    .callDecimals()
    .then((result) => {
      return result;
    })
    .catch((error) => {
      return 0;
    });
  return decimals;
}

export async function tokenApprove(token, contract_address: string, amount) {
  return await token.encodeApprove(contract_address, amount);
}
