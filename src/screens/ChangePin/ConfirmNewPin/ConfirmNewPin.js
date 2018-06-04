// @flow
import * as React from 'react';

import { Text, ActivityIndicator } from 'react-native';
import { connect } from 'react-redux';
import type { NavigationScreenProp } from 'react-navigation';
import { ENCRYPTING, CREATED } from 'constants/walletConstants';
import { PROFILE } from 'constants/navigationConstants';
import { changePinAction } from 'actions/authActions';
import { Container, Center, Wrapper } from 'components/Layout';
import { CloseButton } from 'components/Button/CloseButton';
import Title from 'components/Title';
import ErrorMessage from 'components/ErrorMessage';
import PinCode from 'components/PinCode';
import Button from 'components/Button';
import { UIColors } from 'utils/variables';
import { validatePin } from 'utils/validators';

type Props = {
  changePin: (pin: string) => Function,
  wallet: Object,
  navigation: NavigationScreenProp<*>,
}

type State = {
  pinError: string,
};

const mapStateToProps = ({ wallet }) => ({ wallet });

class ConfirmNewPin extends React.Component<Props, State> {
  state = {
    pinError: '',
  };

  handlePinSubmit = (pin: string) => {
    const { navigation, changePin } = this.props;
    const previousPin = navigation.getParam('pin');
    const validationError = validatePin(pin, previousPin);

    if (validationError) {
      this.setState({
        pinError: validationError,
      });
      return;
    }

    changePin(pin);
  };

  handlePinChange = () => {
    this.setState({
      pinError: '',
    });
  };

  handleScreenDissmisal = () => {
    this.props.navigation.goBack(null);
  };

  render() {
    const { pinError } = this.state;

    const showError = pinError ? <ErrorMessage>{pinError}</ErrorMessage> : null;
    const { walletState } = this.props.wallet;

    if (walletState === ENCRYPTING) {
      return (
        <Container center>
          <Text style={{ marginBottom: 20 }}>{walletState}</Text>
          <ActivityIndicator
            animating
            color="#111"
            size="large"
          />
        </Container>
      );
    }

    if (walletState === CREATED) {
      return (
        <Container center>
          <Text style={{ marginBottom: 20 }}>Pin changed!</Text>
          <Button title="Continue" onPress={() => this.props.navigation.navigate(PROFILE)} />
        </Container>
      );
    }

    return (
      <Container>
        <CloseButton
          icon="md-close"
          onPress={this.handleScreenDissmisal}
          color={UIColors.primary}
          fontSize={32}
        />
        <Wrapper style={{ marginTop: 40 }}>
          {showError}
          <Center>
            <Title center title="confirm new pincode" />
          </Center>
          <PinCode
            onPinEntered={this.handlePinSubmit}
            onPinChanged={this.handlePinChange}
            pageInstructions=""
            showForgotButton={false}
          />
        </Wrapper>
      </Container>
    );
  }
}

const mapDispatchToProps = (dispatch: Function) => ({
  changePin: (pin: string) => {
    dispatch(changePinAction(pin));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmNewPin);
