<template>
<Page class="log-page" actionBarHidden="true">

<StackLayout orientation="vertical">

    <Image src="~/assets/images/logo.png" class="log-logo" height="100"/>
    <Label class="log-ttl" horizontalAlignment="center" v-show="isLoggingIn">
        <Span text="Login" fontAttributes="Bold" />
    </Label>

    <Label class="log-ttl" horizontalAlignment="center" v-show="!isLoggingIn">
        <Span text="Register" fontAttributes="Bold" />
    </Label>
    <StackLayout class="form form-logemail">

      <StackLayout class="input-field logemail-input" v-show="!isLoggingIn">
        <TextField class="input" ref="name" hint="Name" v-model="user.name" returnKeyType="done"/>
        <StackLayout class="hr-light"></StackLayout>
      </StackLayout>

      <StackLayout class="input-field logemail-input">
        <TextField class="input" hint="Email" keyboardType="email" autocorrect="false" autocapitalizationType="none" v-model="user.email" returnKeyType="next" @returnPress="focusPassword"/>
        <StackLayout class="hr-light"></StackLayout>
      </StackLayout>

      <StackLayout class="input-field logemail-input">
        <TextField class="input" ref="password"  hint="Password" secure="true" v-model="user.password" :returnKeyType="isLoggingIn ? 'done' : 'next'" @returnPress="focusConfirmPassword"/>
        <StackLayout class="hr-light"></StackLayout>
      </StackLayout>

      <StackLayout class="input-field logemail-input" v-show="!isLoggingIn">
        <TextField class="input" ref="confirmPassword" hint="Confirm password" secure="true" v-model="user.confirmPassword" returnKeyType="done"/>
        <StackLayout class="hr-light"></StackLayout>
      </StackLayout>

      <StackLayout class="input-field logemail-input" v-show="!isLoggingIn">
        <TextField class="input" ref="birthday" v-model="user.birthday" @tap="selectDate" :editable="false" hint="Please enter your birthday"/>
        <StackLayout class="hr-light"></StackLayout>
      </StackLayout>

      <StackLayout class="input-field logemail-input" v-show="!isLoggingIn">
        <check-box :checked="isChecked" @checkedChange="isChecked = $event.value" />
          <label> I'm older than 13 years old and Accept the</label>
          <label @tap="terms">Terms and Conditions</label>
      </StackLayout>


        <Button v-show="!isLoggingIn" @tap="submit" :isEnabled="isChecked" class="log-bt log-bt-email bt-registeremail">
            <Span text="Register"/>
        </Button>
        <Button v-show="isLoggingIn" @tap="submit" class="log-bt log-bt-email bt-registeremail">
            <Span text="Login"/>  
        </Button>

        <Label class="log-bot" horizontalAlignment="center" @tap="forgotPassword">
              <FormattedString>
                  <Span text="Forgot your password?"/>
              </FormattedString>
        </Label>

        <Label class="log-bot" horizontalAlignment="center" @tap="toggleForm">
              <FormattedString>
                <Span :text="isLoggingIn ? 'Don’t have an account? ' : 'Back to Login'" />
                <Span :text="isLoggingIn ? 'Sign up' : ''"  />
              </FormattedString>
        </Label>


        <Label class="log-bot" horizontalAlignment="center" @tap="toggleForm">
              <FormattedString>
                  <Span v-show="isLoggingIn" :text="isLoggingIn ? 'or' : ''" />
              </FormattedString>
        </Label>

        <Button class="log-bt log-bt-google" v-show="isLoggingIn" @tap="SLGoogle">
          <FormattedString>
              <Span class="fa" text.decode="&#xf1a0; " />
              <Span text="Login with Google"/>
          </FormattedString>
        </Button>

        <Button class="log-bt log-bt-facebook" v-show="isLoggingIn" @tap="SLFacebook">
          <FormattedString>
              <Span class="fa" text.decode="&#xf09a; " />
              <Span text="Login with Facebook"/>
          </FormattedString>
        </Button>
    </StackLayout>

</StackLayout>


</Page>
</template>
<script>

import * as http from "http";
import * as SocialLogin from "nativescript-social-login";


const ModalPicker = require("nativescript-modal-datetimepicker").ModalDatetimepicker;
const picker = new ModalPicker();

var LoadingIndicator = require("nativescript-loading-indicator").LoadingIndicator;
var loader = new LoadingIndicator();


export default {
  
  data() {
    return {
      isLoggingIn: global.isingIn,
      isChecked: false,
      user: {
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        birthday: ""
      }
    };
  },
  mounted(){
    console.log('mounted register'+this.isLoggingIn);
    loader.hide();
  },
  methods: {
  terms: function(){
    
  },  
  selectDate: function () {
        picker.pickDate({
          title: "Select Your Birthday",
          theme: "light",
          maxDate: new Date()
        }).then(result => {
          // Note the month is 1-12 (unlike js which is 0-11)
          console.log(
            "Date is: " + result.day + "-" + result.month + "-" + result.year
          )
          this.user.birthday = result.year + "-" + result.month + "-" + result.day;
          var jsdate = new Date(result.year, result.month - 1, result.day);
        }).catch(error => {
          console.log("Error: " + error);
        })
    },
  SLFacebook(){
      SocialLogin.init();
      loader.show();
      SocialLogin.loginWithFacebook(
            (result) => {
            

            let picture, name, email, user_id;
            picture = result.photo;
            if(picture == "undefined")
              {
              picture = '';
              }
            name = result.displayName;
            email = result.userToken;
            user_id = result.id;
                        
            http.request({
              url: global.server+"/api/login",
              method: "POST",
              headers: { "Content-Type": "application/json" },
                content: JSON.stringify({
                      name: name,
                      email: email,
                      picture: picture,
                      user_id: user_id,
                      provider_id: 1
                  })
                }).then(response => {
                  console.log('facebook logged');
                  
                  global.name = response.content.toJSON().name;
                  global.avatar = response.content.toJSON().avatar;
                  global.provider_id = 1;
                  global.logged = 1;
                  global.uid = response.content.toJSON().id;

                  
                  if(response.content.toJSON().is_new == 1)
                  {
                    loader.hide();
                    this.$goto('welcome');  
                    
                  }
                  else
                  {
                    loader.hide();
                    this.$goto('home');    
                    
                  }
                  }, error => {
                    console.error(error);
                  });         
        }
      )
    },
    SLGoogle(){
          let result = SocialLogin.init({
            isRequestAuthCode: false,
            serverClientId:"726061983704-fdupegqprko6ul38rvhmn9hq7e6l8mge.apps.googleusercontent.com",
            scopes: ["profile", "email"]
              });
            loader.show();  
            SocialLogin.loginWithGoogle(
            (result) => { 
                
                
                let picture, name, email, user_id;
                picture = result.photo;
                if(picture == "undefined")
                  {
                  picture = '';
                  }
                name = result.displayName;
                email = result.userToken;
                user_id = result.authToken;              
                
                http.request({
                  url: global.server+"/api/login",
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                    content: JSON.stringify({
                      name: name,
                      email: email,
                      picture: picture,
                      user_id: user_id,
                      provider_id: 3
                      })
                    }).then(response => {
                      console.log('google logged');

                      global.name = response.content.toJSON().name;
                      global.avatar = response.content.toJSON().avatar;
                      global.provider_id = 1;
                      global.logged = 1;
                      global.uid = response.content.toJSON().id;
                    
                      if(response.content.toJSON().is_new == 1)
                      {
                        loader.hide();
                        this.$goto('welcome');  
                        
                      }
                      else
                      {
                        loader.hide();
                        this.$goto('home');    
                        
                      }
                      }, error => {
                        console.error(error);
                      });                 
                  }
                );    
    },

    toggleForm() {
      this.isLoggingIn = !this.isLoggingIn;
    },
    submit() {
      if (!this.user.email || !this.user.password) {
        this.alert("Please provide both an email address and password.");
        return;
      }
      loader.show();
      if (this.isLoggingIn) {
        this.login();
      } else {
        this.register();
      }
    },
    login() {
            loader.show();
            console.log('login with mail');
            http.request({
              url: global.server+"/api/login",
              method: "POST",
              headers: { "Content-Type": "application/json" },
                content: JSON.stringify({
                  name: this.user.name,
                  email: this.user.email,
                  password: this.user.password,
                  provider_id: 5 //signigica que quiere loguearse
                  })
                }).then(response => {
                  //console.log('google logged' + response.content.toJSON().is_new);
                    loader.hide();
                    if(response.content.toJSON().is_new == 0)
                    {
                      global.name = response.content.toJSON().name;
                      global.avatar = response.content.toJSON().avatar;
                      global.provider_id = 1;
                      global.logged = 1;
                      global.uid = response.content.toJSON().id;
                      this.$goto('home'); 
                    }
                    else
                    {
                      this.alert('Email/Password incorrect');
                    }  

                  }, error => {
                    loader.hide();
                    console.error(error);
                  });    
    },
    register() {
      loader.show();
      var validator = require("email-validator");
      if (!validator.validate(this.user.email)) {
        loader.hide();
        this.alert("Please enter a valid email address.");
        return;
      }      
      if (this.user.password != this.user.confirmPassword) {
        loader.hide();
    this.alert("Your passwords do not match.");
        return;
      }
      if (this.user.password.length < 6) {
        loader.hide();
    this.alert("Your password must at least 6 characters.");
        return;
      }

            http.request({
              url: global.server+"/api/register",
              method: "POST",
              headers: { "Content-Type": "application/json" },
                content: JSON.stringify({
                  name: this.user.name,
                  email: this.user.email,
                  password: this.user.password,
                  provider_id: 4 //signigica que quiere registrarse
                  })
                }).then(response => {
                  console.log('mail logged');
                  console.log(response.content.toJSON().is_new);
                  console.log(response);
                  
                  global.name = response.content.toJSON().name;
                  global.avatar = response.content.toJSON().avatar;
                  global.provider_id = 4;
                  global.logged = 1;
                  global.uid = response.content.toJSON().id;

                  loader.hide();
                  switch(response.content.toJSON().is_new) {
                    case 0: //ya existe mail
                      this.alert('Email already exists');
                      break;
                    case 1: //bien!
                      this.$goto('welcome');  
                      break;                      
                    }
                  }, error => {
                    console.error(error);
                  });    

    },
    forgotPassword() {
      prompt({
        title: "Forgot Password",
        message:
          "Enter the email address you used to register for Famefan to reset your password.",
        inputType: "email",
        defaultText: "",
        okButtonText: "Ok",
        cancelButtonText: "Cancel"
      }).then(data => {
        loader.show();
        if (data.result) {

            http.request({
              url: global.server+"/api/reset",
              method: "POST",
              headers: { "Content-Type": "application/json" },
                content: JSON.stringify({
                  email: data.text
                  })
                }).then(response => {

                  console.log(response.content.toJSON());
                  loader.hide();
                  if(response.content.toJSON() == '1')
                  {
                  this.alert('Email Sent');  
                  }
                  else
                  {
                  this.alert('User not found');    
                  }   
                  

                  }, error => {
                    console.error(error);
                  }); 

        }
      });
    },
    focusPassword() {
      this.$refs.password.nativeView.focus();
    },
    focusConfirmPassword() {
      if (!this.isLoggingIn) {
        this.$refs.confirmPassword.nativeView.focus();
      }
    },
    alert(message) {
      return alert({
        title: "FameFan Login",
        okButtonText: "OK",
        message: message
      });
    }
  }
};
</script>
	