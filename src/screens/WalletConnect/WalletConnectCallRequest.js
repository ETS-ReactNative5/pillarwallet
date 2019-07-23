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
import styled from 'styled-components/native';
import { Keyboard } from 'react-native';
import type { NavigationScreenProp } from 'react-navigation';
import { connect } from 'react-redux';
import { utils, Interface } from 'ethers';
import { CachedImage } from 'react-native-cached-image';
import { createStructuredSelector } from 'reselect';
import { Container, Footer, ScrollWrapper } from 'components/Layout';
import { Label, BoldText, Paragraph } from 'components/Typography';
import Button from 'components/Button';
import Header from 'components/Header';
import TextInput from 'components/TextInput';
import Spinner from 'components/Spinner';
import { onWalletConnectRejectCallRequest } from 'actions/walletConnectActions';
import { fetchGasInfoAction } from 'actions/historyActions';
import { spacing, fontSizes, baseColors, UIColors } from 'utils/variables';
import { getUserName } from 'utils/contacts';
import { getBalance } from 'utils/assets';
import { calculateGasEstimate } from 'services/assets';
import { TOKEN_TRANSFER } from 'constants/functionSignaturesConstants';
import { WALLETCONNECT_PIN_CONFIRM_SCREEN } from 'constants/navigationConstants';
import ERC20_CONTRACT_ABI from 'abi/erc20.json';
import { ETH } from 'constants/assetsConstants';
import type { Asset, Balances } from 'models/Asset';
import type { JsonRpcRequest } from 'models/JsonRpc';
import type { TokenTransactionPayload } from 'models/Transaction';
import type { GasInfo } from 'models/GasInfo';
import { accountBalancesSelector } from 'selectors/balances';

type Props = {
  navigation: NavigationScreenProp<*>,
  rejectCallRequest: (peerId: string, callId: string) => Function,
  session: Object,
  contacts: Object[],
  supportedAssets: Asset[],
  balances: Balances,
  gasInfo: GasInfo,
  fetchGasInfo: Function,
  fromAddress: string,
};

type State = {
  note: ?string,
  gasLimit: number,
};

const FooterWrapper = styled.View`
  flex-direction: column;
  width: 100%;
`;

const LabeledRow = styled.View`
  margin: 10px 0;
`;

const Value = styled(BoldText)`
  font-size: ${fontSizes.medium};
`;

const LabelSub = styled(Label)`
  font-size: ${fontSizes.tiny};
`;

const WarningMessage = styled(Paragraph)`
  text-align: center;
  font-size: ${fontSizes.extraSmall};
  color: ${baseColors.fireEngineRed};
  padding-bottom: ${spacing.rhythm}px;
`;

const OptionButton = styled(Button)`
  margin-top: 14px;
  flex-grow: 1;
`;

const genericToken = require('assets/images/tokens/genericToken.png');

class WalletConnectCallRequestScreen extends React.Component<Props, State> {
  state = {
    note: null,
    gasLimit: 0,
  };

  componentDidMount() {
    this.props.fetchGasInfo();
    const { navigation, fromAddress } = this.props;
    const payload = navigation.getParam('payload', {});
    if (['eth_sendTransaction', 'eth_signTransaction'].includes(payload.method)) {
      calculateGasEstimate({ ...this.parseTransaction(payload), from: fromAddress })
        .then(gasLimit => this.setState({ gasLimit }))
        .catch(() => null);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const {
      fetchGasInfo,
      session: { isOnline },
    } = this.props;
    if (prevProps.session.isOnline !== isOnline && isOnline) {
      fetchGasInfo();
    }
  }

  handleBack = () => {
    const { navigation } = this.props;
    if (navigation.getParam('goBackDismiss', false)) {
      navigation.dismiss();
    } else {
      navigation.goBack(null);
    }
  };

  parseTransaction = (payload: JsonRpcRequest) => {
    const { supportedAssets } = this.props;
    const { value = 0, data } = payload.params[0];
    let { to = '' } = payload.params[0];
    let amount = utils.formatEther(utils.bigNumberify(value).toString());
    const asset = supportedAssets.find(
      ({ address: assetAddress = '' }) => assetAddress.toLowerCase() === to.toLowerCase(),
    );
    if (asset) {
      const iface = new Interface(ERC20_CONTRACT_ABI);
      const parsedTransaction = iface.parseTransaction({ data, value }) || {};
      const {
        args: [
          methodToAddress,
          methodValue = 0,
        ],
      } = parsedTransaction; // get method value and address input
      // do not parse amount as number, last decimal numbers might change after converting
      amount = utils.formatUnits(methodValue, asset.decimals);
      to = methodToAddress;
    }
    return {
      to,
      amount,
      data,
      symbol: asset ? asset.symbol : ETH,
      contractAddress: asset ? asset.address : '',
      decimals: asset ? asset.decimals : 18,
      note: this.state.note,
    };
  };

  getTokenTransactionPayload = (payload: JsonRpcRequest): {
    unsupportedAction: boolean,
    transaction: TokenTransactionPayload,
  } => {
    const { gasInfo } = this.props;
    const { gasLimit } = this.state;
    const transaction = this.parseTransaction(payload);
    const { data, contractAddress } = transaction;

    const isTokenTransfer = data.toLowerCase() !== '0x' && data.toLowerCase().startsWith(TOKEN_TRANSFER);

    /**
     *  we're using our wallet avg gas price and gas limit
     *
     *  the reason we're not using gas price and gas limit provided by WC since it's
     *  optional in platform end while also gas limit and gas price values provided
     *  by platform are not always enough to fulfill transaction
     *
     *  if we start using gasPrice provided by then WC incoming value is gwei in hex
     *  `gasPrice = utils.bigNumberify(gasPrice);`
     *  and both gasPrice and gasLimit is not always present from plaforms
     */

    const defaultGasPrice = gasInfo.gasPrice.avg || 0;
    const gasPrice = utils.parseUnits(defaultGasPrice.toString(), 'gwei');
    const txFeeInWei = gasPrice.mul(gasLimit);

    return {
      unsupportedAction: isTokenTransfer && contractAddress === '',
      transaction: {
        ...transaction,
        gasLimit,
        gasPrice,
        txFeeInWei,
      },
    };
  };

  handleFormSubmit = () => {
    Keyboard.dismiss();
    const { navigation } = this.props;
    const payload = navigation.getParam('payload', {});
    const peerId = navigation.getParam('peerId', {});

    switch (payload.method) {
      case 'eth_sendTransaction':
      case 'eth_signTransaction':
        const {
          transaction: transactionPayload,
        } = this.getTokenTransactionPayload(payload);

        navigation.navigate(WALLETCONNECT_PIN_CONFIRM_SCREEN, {
          peerId,
          payload,
          transactionPayload,
        });

        break;
      case 'eth_sign':
      case 'personal_sign':
        navigation.navigate(WALLETCONNECT_PIN_CONFIRM_SCREEN, {
          peerId,
          payload,
          transactionPayload: null,
        });

        break;
      default:
        break;
    }
  };

  handleNoteChange(text) {
    this.setState({ note: text });
  }

  handleDismissal = () => {
    const { navigation, rejectCallRequest } = this.props;
    navigation.dismiss();
    const peerId = navigation.getParam('peerId', {});
    const payload = navigation.getParam('payload', {});
    rejectCallRequest(peerId, payload.id);
  };

  render() {
    const {
      contacts,
      navigation,
      balances,
    } = this.props;
    const { gasLimit } = this.state;

    const payload = navigation.getParam('payload', {});
    const { icon, name } = navigation.getParam('peerMeta', {});

    let type = 'Call';
    let body = null;
    let address = '';
    let message = '';
    let errorMessage;

    switch (payload.method) {
      case 'eth_sendTransaction':
      case 'eth_signTransaction':
        type = 'Transaction';

        const {
          unsupportedAction,
          transaction: {
            to,
            data = '',
            amount,
            symbol,
            txFeeInWei,
            contractAddress,
          },
        } = this.getTokenTransactionPayload(payload);

        if (unsupportedAction) {
          errorMessage = 'This data transaction or token is not supported in Pillar Wallet yet';
        }

        const txFee = utils.formatEther(txFeeInWei.toString());

        const ethBalance = getBalance(balances, ETH);
        const balanceInWei = utils.parseUnits(ethBalance.toString(), 'ether');
        const enoughBalance = symbol === ETH
          ? balanceInWei.sub(utils.parseUnits(amount.toString(), 'ether')).gte(txFeeInWei)
          : balanceInWei.gte(txFeeInWei);
        if (!errorMessage && !enoughBalance) {
          errorMessage = 'Not enough ETH for transaction fee';
        }
        const contact = contacts.find(({ ethAddress }) => to.toUpperCase() === ethAddress.toUpperCase());
        const recipientUsername = getUserName(contact);

        body = (
          <ScrollWrapper regularPadding color={UIColors.defaultBackgroundColor}>
            <LabeledRow>
              <Label>Request From</Label>
              <Value>{name}</Value>
            </LabeledRow>
            {!!icon && (
              <CachedImage
                key={name}
                style={{
                  height: 55,
                  width: 55,
                  marginBottom: spacing.mediumLarge,
                }}
                source={{ uri: icon }}
                fallbackSource={genericToken}
                resizeMode="contain"
              />
            )}
            {!unsupportedAction &&
              <LabeledRow>
                <Label>Amount</Label>
                <Value>{amount} {symbol}</Value>
              </LabeledRow>
            }
            {!!recipientUsername && (
              <LabeledRow>
                <Label>Recipient Username</Label>
                <Value>{recipientUsername}</Value>
              </LabeledRow>
            )}
            <LabeledRow>
              <Label>Recipient Address</Label>
              <Value>{to}</Value>
            </LabeledRow>
            <LabeledRow>
              <Label>Est. Network Fee</Label>
              <LabelSub>
                Note: a fee below might be shown as higher than provided on the connected platform,
                however, normally it will be less
              </LabelSub>
              {
                (gasLimit !== 0 && <Value>{txFee} ETH</Value>)
                || <Spinner style={{ marginTop: 5 }} width={20} height={20} />
              }
            </LabeledRow>
            {data.toLowerCase() !== '0x' && !contractAddress && (
              <LabeledRow>
                <Label>Data</Label>
                <Value>{data}</Value>
              </LabeledRow>
            )}
            {!!recipientUsername && (
              <TextInput
                inputProps={{
                  onChange: text => this.handleNoteChange(text),
                  value: this.state.note,
                  autoCapitalize: 'none',
                  multiline: true,
                  numberOfLines: 3,
                  placeholder: 'Add a note to this transaction',
                }}
                inputType="secondary"
                labelBigger
                noBorder
                keyboardAvoidance
              />
            )}
          </ScrollWrapper>
        );
        break;
      case 'eth_sign':
        type = 'Message';

        address = payload.params[0]; // eslint-disable-line
        message = payload.params[1]; // eslint-disable-line
        body = (
          <ScrollWrapper regularPadding color={UIColors.defaultBackgroundColor}>
            <LabeledRow>
              <Label>Address</Label>
              <Value>{address}</Value>
            </LabeledRow>
            <LabeledRow>
              <Label>Message</Label>
              <Value>{message}</Value>
            </LabeledRow>
          </ScrollWrapper>
        );
        break;
      case 'personal_sign':
        type = 'Message';

        address = payload.params[1]; // eslint-disable-line
        message = utils.toUtf8String(payload.params[0]);
        body = (
          <ScrollWrapper regularPadding color={UIColors.defaultBackgroundColor}>
            <LabeledRow>
              <Label>Address</Label>
              <Value>{address}</Value>
            </LabeledRow>
            <LabeledRow>
              <Label>Message</Label>
              <Value>{message}</Value>
            </LabeledRow>
          </ScrollWrapper>
        );
        break;
      default:
        break;
    }

    return (
      <Container color={baseColors.white}>
        <Header onBack={this.handleBack} title={`${type} Request`} white />
        {body}
        <Footer keyboardVerticalOffset={40} backgroundColor={UIColors.defaultBackgroundColor}>
          {!!errorMessage && <WarningMessage>{errorMessage}</WarningMessage>}
          <FooterWrapper>
            <OptionButton
              primaryInverted
              onPress={this.handleFormSubmit}
              disabled={!!errorMessage || (type === 'Transaction' && gasLimit === 0)}
              textStyle={{ fontWeight: 'normal' }}
              title={`Approve ${type}`}
            />
            <OptionButton
              dangerInverted
              onPress={this.handleDismissal}
              textStyle={{ fontWeight: 'normal' }}
              title="Reject"
            />
          </FooterWrapper>
        </Footer>
      </Container>
    );
  }
}

const mapStateToProps = ({
  assets: { supportedAssets },
  contacts: { data: contacts },
  session: { data: session },
  history: { gasInfo },
  wallet: { data: { address: fromAddress } },
}) => ({
  contacts,
  session,
  supportedAssets,
  gasInfo,
  fromAddress,
});

const structuredSelector = createStructuredSelector({
  balances: accountBalancesSelector,
});

const combinedMapStateToProps = (state) => ({
  ...structuredSelector(state),
  ...mapStateToProps(state),
});

const mapDispatchToProps = dispatch => ({
  rejectCallRequest: (peerId: string, callId: string) => {
    dispatch(onWalletConnectRejectCallRequest(peerId, callId));
  },
  fetchGasInfo: () => dispatch(fetchGasInfoAction()),
});

export default connect(combinedMapStateToProps, mapDispatchToProps)(WalletConnectCallRequestScreen);
