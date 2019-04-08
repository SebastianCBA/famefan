<template>
	<Page class="log-page" actionBarHidden="true">
		<StackLayout orientation="vertical">

        <Image src="~/assets/images/logo.png" class="log-logo" height="100"/>

        <Label class="log-ttl" horizontalAlignment="center">
            <Span text="Login" fontAttributes="Bold" />
        </Label>

        <Button class="log-bt log-bt-google" v-show="isLoggingIn" @tap="SLGoogle">
          <FormattedString>
              <Span class="fa" text.decode="&#xf1a0; " />
              <Span text="Continue with Google"/>
          </FormattedString>
        </Button>

        <Button class="log-bt log-bt-facebook" v-show="isLoggingIn" @tap="SLFacebook">
          <FormattedString>
              <Span class="fa" text.decode="&#xf09a; " />
              <Span text="Continue with Facebook"/>
          </FormattedString>
        </Button>
        
        <Button class="log-bt log-bt-email" v-show="isLoggingIn" @tap="loginMail">
          <FormattedString>
              <Span class="fa" text.decode="&#xf0e0; " />
              <Span text="Continue with Email"/>
          </FormattedString>
        </Button>

        <Label class="log-bot" horizontalAlignment="center" @tap="prelogin">
            <FormattedString>
                <Span text="Not a member?"/>
                <Span text=" Sign up"/>
            </FormattedString>
        </Label>
		
    </StackLayout>
	</Page>
</template>

<script>
  

import * as http from "http";
import * as SocialLogin from "nativescript-social-login";

var LoadingIndicator = require("nativescript-loading-indicator").LoadingIndicator;
var loader = new LoadingIndicator();

export default {
  data() {
    return {
      isLoggingIn: global.isingIn,
      user: {
        email: "test@test.com",
        password: "tester",
        confirmPassword: "tester"
      }
    };
  },

  methods: {
   
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
  prelogin(){
    loader.show();
    this.$goto('prelogin'); 
    loader.hide();
  },  
  loginMail(){
    loader.show();
    global.isingIn = true;
    this.$goto('login_mail'); 
    loader.hide();
 },   
  }
};
</script>
	
<style scoped lang="scss">
    // Start custom common variables
    @import '../app-variables';

    // Custom styles

</style>