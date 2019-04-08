<template>
    <ScrollView>
		<FlexboxLayout class="page">
                    <StackLayout  orientation="vertical"  class="item_template" >
                        
                        <AbsoluteLayout>                        
                            <Image class="item_image" v-show="postcontent.source_id != 4 && !(postcontent.post_image_remote === undefined) && postcontent.post_image_remote.length > 5" :src="postcontent.post_image_remote"/>
                            <Image class="item_image" v-show="postcontent.source_id == 4 && !(postcontent.videoid === undefined)" :src="'https://img.youtube.com/vi/'+postcontent.videoid+'/0.jpg'"/>

                            <StackLayout>
                                <Label class="item_ago" :text="postcontent.source_name+' '+postcontent.ago"/> 
                            </StackLayout>      
                        </AbsoluteLayout>                      
                        <GridLayout columns="auto, *, 20, 20, 20, 20, 20, 20" rows="auto, *, *, 100, 20" class="item_template item_description">
                            <StackLayout class="avatar" @tap="gotoartist(postcontent.celebrity_id)">
                                <Image  class="circle-wrapper" :src="'https://www.famefan.com/images/size/60/'+postcontent.profile_picture"/>
                            </StackLayout>                            
                             
                            <Label row="0" col="1" class="item_artistname" :text="postcontent.name" @tap="gotoartist(postcontent.celebrity_id)"/>
                            <Label row="0" col="2" class="item_artistname zmdi" @tap="like(postcontent.id)">{{'zmdi-star-outline' | fonticon}}</Label>
                            <Label v-show="postcontent.likes > 0" row="0" col="3" class="item_artistname" :text="postcontent.likes"/>
                            <Label row="0" col="4" class="item_artistname fa">{{'fa-comment' | fonticon}}</Label>
                            <Label row="0" col="6" class="item_artistname fa" @tap="share(postcontent.post_link, postcontent.post_title)">{{'fa-share' | fonticon}}</Label>
                            <TextView v-show="postcontent.source_id != 1 && postcontent.source_id != 3" row="1" colSpan="5" class="item_description" :text="postcontent.post_title"/>
                            <TextView v-show="postcontent.source_id == 1" row="1" colSpan="5" class="item_description" :text="postcontent.post_description"/>
                            <TextView v-show="postcontent.source_id == 3 || postcontent.source_id == 7" row="1" colSpan="5" class="item_description" :text="postcontent.post_description"/>
                        <ListView row="2" colSpan="8" ref="listView" for="item in itemList">                        
                            <v-template>
                                    <StackLayout orientation="vertical"  class="item_template" >
                                        <label class="font-14" :text="item.comment"/>
                                        <label :text="item.name + ' ' +item.ago"/>
                                    </StackLayout>
                            </v-template>
                        </ListView>
                        <TextView ref="comment" row="3" colSpan="8" style="margin-top: 15px" borderColor="#DEDEDE" borderWidth="1" height="100px" hint="Enter Comment"  returnKeyType="send" class="input input-border">
                        </TextView>    
                        <Button ref="comment" row="4" colSpan="8" @tap="submit" :isEnabled="isChecked" class="log-bt log-bt-email bt-registeremail">
                            <Span text="Register"/>
                        </Button>                                            
                        </GridLayout>                            

                    </StackLayout>   
		</FlexboxLayout>
  </ScrollView>                    
</template>

<script>
    import Vue from "nativescript-vue";
    import {StackLayout} from "tns-core-modules/ui/layouts/stack-layout";
    import * as http from "http";
    import {ScrollView} from "tns-core-modules/ui/scroll-view";
    import {Popup} from "nativescript-popup";
    import * as SocialShare from "nativescript-social-share";

    export default {
        data() {
            return {
                titulo: null,
                postcontent: [],
                itemList: [],
                listView: false,
                url: global.server+'api/home/'+global.uid,
                processing: true,
                isChecked: false,
                comment: ''
            };
        },
        mounted() {
            this.listView = this.$refs.listView.nativeView;
        },
        methods: {
            submit(){
                console.log('submit');
                http.request({
                url: global.server+"/api/comment",
                method: "POST",
                headers: { "Content-Type": "application/json" },
                    content: JSON.stringify({
                    user_id: global.uid,
                    comment: this.comment,
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
            setdata(post) {
                this.postcontent = post;
              //  this.itemList = this.postcontent.comments;
                let vm = this;
                this.processing = true;
                console.log(global.server+'/api/post/comments/'+global.uid+'/'+this.postcontent.id);
                  http.request({
                        url: global.server+'/api/post/comments/'+global.uid+'/'+this.postcontent.id,
                        method: "GET",
                          }).then(response => {
                                        this.processing = false;
                                        console.log('termine de cargar comentarios');
                                        vm.itemList = response.content.toJSON();
                                        console.log(vm.itemList.length);
                                        /*console.log(response.content.toJSON().data.length);
                                        
                                        for (let i = 0; i < response.content.toJSON().data.length; i++) { 
                                            vm.itemList.push(response.content.toJSON().data[i])    
                                        }
                                        console.log(vm.itemList);*/
                                        vm.$refs.listView.notifyLoadOnDemandFinished();
                            }, error => { console.log(error);}   );
                    },
                share(url, title){
                    console.log(url);
                    console.log(title);
                    SocialShare.shareUrl(url, title);
                },
                like(id){
                   console.log(id);
                   //this.count = this.count + 1;
                   http.request({
                        url: global.server+'/api/post/like/'+global.uid+'/'+id,
                        method: "GET",
                          }).then(response => {
                                console.log('volvi'+ (this.postcontent.likes + 1));
                                this.postcontent.likes = this.postcontent.likes + 1;
  
                                });                    
                },      
                gotoartist(id)
                {
                  global.artist_id = id;  
                  console.log(id);
                  this.$goto('artist');                    
                }                            
        }
    }
</script>

<style>
</style>