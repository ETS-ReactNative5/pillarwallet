// @flow
/*
    Pillar Wallet: the personal data locker
    Copyright (C) 2021 Stiftung Pillar Project

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
import styled from 'styled-components/native';
import { useTranslation } from 'translations/translate';

// Components
import Text from 'components/core/Text';
import Modal from 'components/Modal';
import Icon from 'components/core/Icon';

// Selectors
import { useSupportedChains } from 'selectors/chains';

// Utils
import { fontStyles, spacing, borderRadiusSizes } from 'utils/variables';
import { useChainsConfig } from 'utils/uiConfig';

// Types
import { type Chain } from 'models/Chain';

// Local
import SwitchChainModal from './SwitchChainModal';

type itemType = {|
  key: ?Chain,
  title: ?string,
|};

interface Props {
  selectedChain: (?Chain) => void;
}

function DropdownChainView({ selectedChain }: Props) {
  const tabItems = useTabItems();
  const [activeItem, setActiveItem] = React.useState(tabItems[0]);

  const updateActiveChain = (chain?) => {
    selectedChain(chain ?? null);
  };

  const updateActiveItem = (item?) => {
    if (item) setActiveItem(item);
  };

  const closeModal = () => Modal.closeAll();

  const openSwitchChainModal = () => {
    Modal.open(() => {
      return (
        <SwitchChainModal
          items={tabItems}
          activeItem={activeItem}
          updateActiveChain={updateActiveChain}
          updateActiveItem={updateActiveItem}
          closeModal={closeModal}
        />
      );
    });
  };
  const { key, title } = activeItem;

  return (
    <ContainerView isSelected>
      <RowContainer>
        <ChainViewIcon size={24} style={IconContainer} name={key ?? 'all-networks'} />
        <Title>{title}</Title>
        <TouchableContainer onPress={() => openSwitchChainModal()}>
          <ChainViewIcon name="chevron-down" />
        </TouchableContainer>
      </RowContainer>
    </ContainerView>
  );
}

export default DropdownChainView;

const useTabItems = (): itemType[] => {
  const { t } = useTranslation();
  const chains = useSupportedChains();
  const config = useChainsConfig();

  const chainTabs = chains.map((chain) => ({
    key: chain,
    title: config[chain].titleShort,
  }));
  return [{ key: null, title: t('label.all') }, ...chainTabs];
};

const ContainerView = styled.View`
  background-color: ${({ theme, isSelected }) => (isSelected ? theme.colors.basic080 : theme.colors.basic050)};
  margin: 0 ${spacing.layoutSides}px;
  padding: ${spacing.large}px;
  border-radius: ${borderRadiusSizes.medium}px;
`;

const RowContainer = styled.View`
  align-items: center;
  justify-content: center;
  flex-direction: row;
  padding: ${spacing.small}px;
`;

const IconContainer = styled.View`
  align-items: center;
  justify-content: center;
`;

const Title = styled(Text)`
  flex: 1;
  flex-direction: row;
  ${fontStyles.medium};
  padding: 0 ${spacing.medium}px 0 ${spacing.medium}px;
`;

const ChainViewIcon = styled(Icon)`
  height: 24px;
  width: 24px;
  background-color: ${({ theme }) => theme.colors.basic050};
  border-radius: ${borderRadiusSizes.medium}px;
`;

const TouchableContainer = styled.TouchableOpacity`
  align-items: center;
  justify-content: center;
`;
