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

import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Keyboard } from 'react-native';
import { createStructuredSelector } from 'reselect';
import styled, { withTheme } from 'styled-components/native';
import t from 'translations/translate';
import TextInput from 'components/TextInput';
import PercentsInputAccessoryHolder, {
  INPUT_ACCESSORY_NATIVE_ID,
} from 'components/PercentsInputAccessory/PercentsInputAccessoryHolder';
import SelectorOptions from 'components/SelectorOptions';
import CollectibleImage from 'components/CollectibleImage';
import { MediumText } from 'components/Typography';
import Icon from 'components/Icon';
import Input from 'components/Input';
import { Spacing } from 'components/Layout';
import Modal from 'components/Modal';

import { formatAmount, isValidNumber, noop, toFixedString } from 'utils/common';
import { getThemeColors } from 'utils/themes';
import { images } from 'utils/images';
import { calculateMaxAmount, getFormattedBalanceInFiat, getBalanceInFiat } from 'utils/assets';

import { COLLECTIBLES, TOKENS, BTC, defaultFiatCurrency } from 'constants/assetsConstants';
import { MIN_WBTC_CAFE_AMOUNT } from 'constants/exchangeConstants';
import { getAssetBalanceFromFiat } from 'screens/Exchange/utils';

import { accountBalancesSelector } from 'selectors/balances';
import { visibleActiveAccountAssetsWithBalanceSelector } from 'selectors/assets';
import { activeAccountMappedCollectiblesSelector } from 'selectors/collectibles';

import type { RootReducerState } from 'reducers/rootReducer';
import type { Rates, Balances } from 'models/Asset';
import type { Option, HorizontalOption } from 'models/Selector';
import type { Theme } from 'models/Theme';
import type { TransactionFeeInfo } from 'models/Transaction';

import ValueInputHeader from './ValueInputHeader';

export type ExternalProps = {
  disabled?: boolean,
  customAssets?: Option[],
  customBalances?: Balances,
  selectorOptionsTitle?: string,
  assetData: Option,
  onAssetDataChange: (Option) => void,
  value: string,
  onValueChange: (string, number | void) => void, // `newPercent` provided as the second argument (if used by user)
  horizontalOptions?: HorizontalOption[],
  showCollectibles?: boolean,
  txFeeInfo?: ?TransactionFeeInfo,
  hideMaxSend?: boolean,
  updateTxFee?: (string, number) => Object,
  leftSideSymbol?: string,
  getInputRef?: (Input) => void,
  onFormValid?: (boolean) => void,
  disableAssetChange?: boolean,
  customRates?: Rates,
};

type InnerProps = {
  assets: Option[],
  balances: Balances,
  baseFiatCurrency: ?string,
  rates: Rates,
  collectibles: Option[],
  theme: Theme,
};

type Props = InnerProps & ExternalProps;

const CollectibleWrapper = styled.View`
  align-items: center;
`;

const SelectorChevron = styled(Icon)`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.basic030};
`;

export const getErrorMessage = (
  amount: string,
  assetBalance: string,
  assetSymbol: string,
  fiatValue?: ?string,
): string => {
  const isValid = isValidNumber(amount);
  if (!isValid || (!!fiatValue && !isValidNumber(fiatValue))) {
    return t('error.amount.invalidNumber');
  } else if (assetSymbol !== BTC && Number(assetBalance) < Number(amount)) {
    return t('error.amount.notEnoughToken', { token: assetSymbol });
  } else if (assetSymbol === BTC && +amount && Number(amount) < MIN_WBTC_CAFE_AMOUNT) {
    return t('wbtcCafe.higherAmount');
  }
  return '';
};

export const ValueInputComponent = (props: Props) => {
  const {
    disabled,
    assets,
    customAssets,
    balances,
    customBalances,
    baseFiatCurrency,
    rates,
    selectorOptionsTitle = t('transactions.title.valueSelectorModal'),
    assetData,
    onAssetDataChange,
    value,
    onValueChange,
    horizontalOptions,
    showCollectibles,
    txFeeInfo,
    hideMaxSend,
    updateTxFee,
    collectibles,
    theme,
    leftSideSymbol,
    getInputRef,
    onFormValid,
    disableAssetChange,
    customRates,
  } = props;

  const [valueInFiat, setValueInFiat] = useState<string>('');
  const [displayFiatAmount, setDisplayFiatAmount] = useState<boolean>(false);

  const ratesWithCustomRates = { ...rates, ...customRates };

  const assetSymbol = assetData.symbol || '';
  const assetBalance = (customBalances || balances)[assetSymbol]?.balance || '0';
  const maxValue = calculateMaxAmount(assetSymbol, assetBalance, txFeeInfo?.fee, txFeeInfo?.gasToken);

  const fiatCurrency = baseFiatCurrency || defaultFiatCurrency;

  const formattedMaxValueInFiat = getFormattedBalanceInFiat(fiatCurrency, maxValue, ratesWithCustomRates, assetSymbol);
  const formattedValueInFiat = getFormattedBalanceInFiat(fiatCurrency, value, ratesWithCustomRates, assetSymbol);

  React.useEffect(() => {
    if (disabled) { // handle fiat updates when disabled, e.g. on Exchange screen
      const fiatValue = getBalanceInFiat(fiatCurrency, value, ratesWithCustomRates, assetSymbol);
      setValueInFiat(String(fiatValue ? fiatValue.toFixed(2) : 0));
    }
  }, [value]);

  const handleValueChange = (newValue: string) => {
    // ethers will crash with commas, TODO: we need a proper localisation
    newValue = newValue.replace(/,/g, '.');
    if (displayFiatAmount) {
      const split = newValue.split('.');
      // only allow 2 decimals in fiat mode
      if (split.length <= 2 && !(split[1] && split[1].length > 2)) {
        setValueInFiat(newValue);
        const convertedValue =
        getAssetBalanceFromFiat(baseFiatCurrency, newValue, ratesWithCustomRates, assetSymbol).toString();
        onValueChange(convertedValue);
      }
    } else {
      const fiatValue = getBalanceInFiat(fiatCurrency, newValue, ratesWithCustomRates, assetSymbol);
      setValueInFiat(String(fiatValue ? fiatValue.toFixed(2) : 0));
      onValueChange(newValue);
    }
  };

  const handleUsePercent = async (percent: number) => {
    let newTxFeeInfo = txFeeInfo;
    if (updateTxFee) {
      newTxFeeInfo = await updateTxFee(assetSymbol, percent / 100);
    }
    const newMaxValue = calculateMaxAmount(
      assetSymbol,
      assetBalance,
      newTxFeeInfo?.fee,
      newTxFeeInfo?.gasToken,
    );
    const maxValueInFiat = getBalanceInFiat(fiatCurrency, newMaxValue, ratesWithCustomRates, assetSymbol);
    if (percent === 100) {
      onValueChange(newMaxValue, percent);
    } else {
      onValueChange(toFixedString(parseFloat(newMaxValue) * (percent / 100)), percent);
    }
    const fiatValue = maxValueInFiat * (percent / 100);
    setValueInFiat(String(fiatValue ? fiatValue.toFixed(2) : 0));
  };

  const onInputBlur = () => {
    PercentsInputAccessoryHolder.removeAccessory();
  };

  const onInputFocus = () => {
    PercentsInputAccessoryHolder.addAccessory(handleUsePercent);
  };

  const assetsOptions = customAssets || assets;

  const openAssetSelector = () => {
    const optionTabs = showCollectibles
      ? [{
        name: t('label.tokens'),
        options: assetsOptions,
        id: TOKENS,
      }, {
        name: t('label.collectibles'),
        options: collectibles,
        id: COLLECTIBLES,
        collectibles: true,
      }]
      : undefined;

    Keyboard.dismiss();

    Modal.open(() => (
      <SelectorOptions
        title={selectorOptionsTitle}
        options={assetsOptions}
        horizontalOptionsData={horizontalOptions}
        onOptionSelect={onAssetDataChange}
        optionTabs={optionTabs}
      />
    ));
  };

  const getCustomLabel = () => {
    return (
      <ValueInputHeader
        asset={assetData}
        onAssetPress={openAssetSelector}
        labelText={hideMaxSend ? null : `${formatAmount(maxValue, 2)} ${assetSymbol} (${formattedMaxValueInFiat})`}
        onLabelPress={() => !disabled && handleUsePercent(100)}
        disableAssetSelection={disableAssetChange || assetsOptions.length <= 1}
      />
    );
  };

  const inputProps = {
    value: displayFiatAmount ? valueInFiat : value,
    maxLength: 42,
    customLabel: getCustomLabel(),
    onChange: handleValueChange,
    placeholder: '0',
    keyboardType: 'decimal-pad',
    editable: !disabled,
    inputAccessoryViewID: INPUT_ACCESSORY_NATIVE_ID,
    onBlur: onInputBlur,
    onFocus: onInputFocus,
    selection: disabled ? { start: 0, end: 0 } : null,
  };

  const errorMessage = disabled ? null : getErrorMessage(
    value, maxValue, assetSymbol, displayFiatAmount ? valueInFiat : null,
  );

  React.useEffect(() => {
    if (onFormValid) {
      onFormValid(!errorMessage);
    }
  }, [errorMessage]);

  const colors = getThemeColors(theme);
  const { towellie: genericCollectible } = images(theme);

  const { tokenType = TOKENS } = assetData;

  const toggleDisplayFiat = () => {
    // when switching at error state, reset values to avoid new errors
    if (errorMessage) {
      setValueInFiat('0');
      handleValueChange('0');
    }
    setDisplayFiatAmount(!displayFiatAmount);
  };

  return (
    <>
      {tokenType === TOKENS && (
        <TextInput
          style={{ width: '100%' }}
          hasError={!!errorMessage}
          errorMessage={errorMessage}
          inputProps={inputProps}
          numeric
          itemHolderStyle={{ borderRadius: 10 }}
          onRightAddonPress={disableAssetChange ? noop : openAssetSelector}
          leftSideText={displayFiatAmount
            ? t('tokenValue', { value: formatAmount(value || '0', 2), token: assetSymbol || '' })
            : formattedValueInFiat
          }
          onLeftSideTextPress={toggleDisplayFiat}
          rightPlaceholder={displayFiatAmount ? fiatCurrency : assetSymbol}
          leftSideSymbol={leftSideSymbol}
          getInputRef={getInputRef}
          inputWrapperStyle={{ zIndex: 10 }}
          customInputHeight={62}
        />
      )}
      {tokenType === COLLECTIBLES && (
        <CollectibleWrapper>
          <MediumText medium onPress={disableAssetChange ? noop : openAssetSelector}>{assetData.name}
            <SelectorChevron name="selector" color={colors.labelTertiary} />
          </MediumText>
          <Spacing h={16} />
          <CollectibleImage
            source={{ uri: assetData.imageUrl }}
            fallbackSource={genericCollectible}
            resizeMode="contain"
            width={180}
            height={180}
          />
        </CollectibleWrapper>
      )}
    </>
  );
};

const mapStateToProps = ({
  appSettings: { data: { baseFiatCurrency } },
  rates: { data: rates },
}: RootReducerState): $Shape<Props> => ({
  baseFiatCurrency,
  rates,
});

const structuredSelector = createStructuredSelector({
  balances: accountBalancesSelector,
  assets: visibleActiveAccountAssetsWithBalanceSelector,
  collectibles: activeAccountMappedCollectiblesSelector,
});

const combinedMapStateToProps = (state: RootReducerState): $Shape<Props> => ({
  ...structuredSelector(state),
  ...mapStateToProps(state),
});


export default withTheme(connect(combinedMapStateToProps)(ValueInputComponent));
