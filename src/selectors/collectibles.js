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

import { createSelector } from 'reselect';
import { mapValues } from 'lodash';

// types
import type { ChainRecord } from 'models/Chain';
import type {
  Collectible,
  CollectiblesHistoryStore,
  CollectiblesStore,
  CollectibleTransaction,
} from 'models/Collectible';

// selectors
import { collectiblesSelector, collectiblesHistorySelector, activeAccountIdSelector } from './selectors';


export const accountCollectiblesSelector = createSelector(
  collectiblesSelector,
  activeAccountIdSelector,
  (collectibles: CollectiblesStore, activeAccountId: ?string): ChainRecord<Collectible[]> => {
    if (!activeAccountId) return { ethereum: [] };
    return collectibles[activeAccountId] || { ethereum: [] };
  },
);

export const accountCollectiblesHistorySelector = createSelector(
  collectiblesHistorySelector,
  activeAccountIdSelector,
  (history: CollectiblesHistoryStore, activeAccountId: ?string): ChainRecord<CollectibleTransaction[]> => {
    if (!activeAccountId) return { ethereum: [] };
    return history[activeAccountId] ?? { ethereum: [] };
  },
);

export const activeAccountMappedCollectiblesSelector = createSelector(
  accountCollectiblesSelector,
  (collectiblesPerChain: ChainRecord<Collectible[]>) => mapValues(
    collectiblesPerChain,
    (collectibles) => (collectibles ?? []).map((collectible) => {
      const { icon, id } = collectible;
      return {
        imageUrl: icon,
        value: id,
        tokenId: id,
        ...collectible,
      };
    }),
  ),
);
