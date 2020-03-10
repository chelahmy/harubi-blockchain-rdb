import React from 'react'
import Foundation from 'foundation-sites'
import BackendRequest from './utils/serve'
import Form from './components/form'
import Input from './components/input'
import TextArea from './components/textarea'
import { randomSeed, encryptSeed, decryptSeed,
  sha256, stringToBytes, keyPair, signBytes,
  verifySignature } from '@waves/ts-lib-crypto'

export default class SignUp extends React.Component {
  constructor(props) {
    super(props)
    this.handleOnFormMount = this.handleOnFormMount.bind(this)
    this.handleOnFormSubmit = this.handleOnFormSubmit.bind(this)
  }

  handleOnFormMount(obj) {
    this.form = obj
  }

  handleOnFormSubmit(ev,frm) {
    // Get data from the form
    let data = new FormData(ev.target)
    let seed = data.get('seed')
    let password = data.get('password')
    let valid = new RegExp(/^[a-z]+(?:[\s][a-z]+)*$/).test(seed);
    if (valid) {
      const encryptedSeed = encryptSeed(seed, password)
      if (encryptedSeed.length > 255) {
        this.form.callOut(title, 'The Waves seed is too long.', 'alert')
        valid = false
      }
    }
    if (valid) {
      console.log('Sign Up Ok')
      this.form.removeErrorClasses('seed')
    }
    else {
      this.form.addErrorClasses('seed')
      return
    }
    return
    BackendRequest({ // params
      model: 'user',
      action: 'signup',
      name: data.get('name'),
      password: password,
      email: data.get('email'),
      seed: encryptSeed
    },
    (resp) => { // success
      this.props.page.navigate(this.props.onSuccessPage)
    },
    (title, message) => { // error
      this.form.callOut(title, message, 'alert')
    },
    () => { // reset
      this.props.page.navigate('home')
    })
  }

  render() {
    const seed = randomSeed()
    const encrypted = encryptSeed(seed, 'secure password')
    console.log('encrypted: ' + encrypted);
    const decrypted = decryptSeed(encrypted, 'secure password')
    console.log('decrypted: ' + decrypted);
    const hash = sha256(stringToBytes("My data"))
    console.log('hash: ' + hash);
    const keys = keyPair(decrypted)
    console.log(keys);
    const signature = signBytes(keys, hash)
    console.log('signature: ' + signature);
    console.log('publicKey: ' + keys.publicKey);
    const verify = verifySignature(keys.publicKey, hash, signature)
    console.log('verify: ' + verify);

    return (
      <Form
        onSubmit={this.handleOnFormSubmit}
        submitValue="Sign Up" wantReset
        onMount={this.handleOnFormMount}>
        <Input label="Name" name="name" type="text" placeholder="Your user name" pattern="alpha_numeric" required
          helpText="A user name is unique through out the system."
          errorMessage="An alpha-numeric user name is required. Spaces and symbols are not allowed."/>
        <Input label="E-mail" name="email" type="text" placeholder="Your e-mail address" pattern="email" required
          errorMessage="A valid e-mail address is required."/>
        <Input label="Password" name="password" type="password" placeholder="Your password" required
          errorMessage="Password is required."/>
        <Input label="Re-Enter Password" name="re_password" type="password" placeholder="Re-enter your password" required
          dataEqualTo="password" errorMessage="Passwords mismatched."/>
        <TextArea label="Waves Seed" name="seed" placeholder="Your Waves seed" pattern="[a-z]+(?:[\\s][a-z]+)*" required
          defaultValue={seed}
          helpText="This seed is autogenerated. You may use your own Waves seed. Please write down the seed and keep it safe."
          errorMessage="Waves seed is required. A valid seed is made up of a series of 15 small-letter words. Numbers and symbols are not allowed."/>
      </Form>
    )
  }
}
