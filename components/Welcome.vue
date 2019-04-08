<template>
    <Page class="log-page" actionBarHidden="true">

        <GridLayout rows="50, 40, 40, *,60">   
            <Label class="log-ttl-int" horizontalAlignment="left" row="0">
                <Span text="Welcome!" fontAttributes="Bold" />
            </Label>                    
            
            <StackLayout class="input-field" row="1">
                        <TextField class="input" ref="searchtext" hint="Search" @textChange="search" />
                        <StackLayout class="hr-light"></StackLayout>
            </StackLayout>                    

            <Label class="log-ttl-int font-14" row="2" horizontalAlignment="left">
                <FormattedString>
                    <Span text=" or pick some from the list below"/>
                </FormattedString>
            </Label>                
                
              <RadListView row="3" ref="listView" for="item in celebs" 
                            loadOnDemandMode="Auto" 
                            @loadMoreDataRequested="onLoadMoreData">
                                          
                <v-template>
                    <StackLayout orientation="vertical"  class="item_template">

                        <GridLayout columns="auto, *, 140" rows="auto, *" class="item_template">
                            <StackLayout class="avatar" @tap="gotoartist(item.c_id)">
                                <Image  class="circle-wrapper" :src="'https://www.famefan.com/images/size/60/'+item.profile_picture"/>
                            </StackLayout>                            
                            
                            <Label row="0" col="1" class="item_artistname" :text="item.name"/>
                            <Button class="log-bt log-bt-verde" v-show="item.user_id == 0" row="0" col="2" @tap="befan(item.c_id)">Become a Fan</Button>
                            <Button class="log-bt log-bt-rojo" v-show="item.user_id != 0" row="0" col="2" @tap="unfan(item.c_id)">I'm a Fan</Button>
                        </GridLayout>                            
                    </StackLayout>    
                </v-template>
              </RadListView>
            <StackLayout row="4" orientation="horizontal" style="background-color: #FFF">
                <Button textWrap="true" class="but_fotter" textAlignment="text" @tap="gohome">
                    <FormattedString>
                        <Span text="CONTINUE"></Span>
                        <Span class="zmdi"> {{'zmdi-long-arrow-right' | fonticon}}</Span>
                        
                    </FormattedString>
                </Button>
            </StackLayout>     
        </GridLayout>
    </Page>
</template>

<script>

import * as http from "http";
import { ItemEventData, ListView } from "tns-core-modules/ui/list-view";

var LoadingIndicator = require("nativescript-loading-indicator").LoadingIndicator;
var loader = new LoadingIndicator();


//const api = 'https://www.famefan.com/api/home/'+global.uid;


    export default {
            data() {
                return {
                  count: 0,          
                  page: 1,
                  celebs:[],
                  server: global.server,
                  url_celebs: global.server+'/api/artists/'+global.uid,
                };
            },
            mounted(){
                loader.show();
                this.infiniteHandler();
                this.listView = this.$refs.listView.nativeView;
                console.log('home mounted');
            },   
            methods: {
                gohome(){
                        loader.show();
                        if(this.count == 0)
                        {
                        this.$goto('home'); 
                        } else
                        {
                        global.my_feed = 1;    
                        this.$goto('home'); 
                        }                        
                        loader.hide();                
                    }, 
                search(textfield){
                    loader.show();
                    this.page=0;
                    this.celebs = [];
                    let vm = this;
                  http.request({
                        url: this.url_celebs+'/search/'+textfield.object.text+'?page='+vm.page,
                        method: "GET",
                          }).then(response => {
                                        loader.hide();    
                                        for (let i = 0; i < response.content.toJSON().data.length; i++) { 
                                            vm.celebs.push(response.content.toJSON().data[i])    
                                        }
                                        vm.$refs.listView.notifyLoadOnDemandFinished();
                                        
                                });                    
                },
                befan(id)
                {
                   console.log(id);
                   this.count = this.count + 1;
                   http.request({
                        url: global.server+'/api/artist/befan/'+global.uid+'/'+id,
                        method: "GET",
                          }).then(response => {
                                        console.log("done");
                                });
                   let originalList = this.celebs;
                   console.log(originalList.length);
                   let i;
                    for(i = 0; i < originalList.length; i++){
                        if(originalList[i].c_id == id)
                            {
                            originalList[i].user_id = 1;
                            }
                        
                        console.log(this.celebs[i].user_id);
                        }                   
                    
                },
                unfan(id)
                {
                   console.log(id);
                   this.count = this.count - 1;
                    http.request({
                        url: global.server+'/api/artist/unfan/'+global.uid+'/'+id,
                        method: "GET",
                          }).then(response => {
                                        console.log("done");
                                });
                   let originalList = this.celebs;
                   console.log(originalList.length);
                   let i;
                    for(i = 0; i < originalList.length; i++){
                        if(originalList[i].c_id == id)
                            {
                            originalList[i].user_id = 0;
                            }
                        
                        console.log(this.celebs[i].user_id);
                        }                   
                    
                },


                gotoartist(id)
                {
                  global.artist_id = id;  
                  console.log(id);
                  loader.show();
                  this.$goto('artist');                    
                },
                onLoadMoreData(){
                    this.infiniteHandler();
                    this.page = this.page + 1;
                },
                infiniteHandler() {
                  console.log('start infinite');
                  let vm = this;

                  http.request({
                        url: this.url_celebs+'?page='+vm.page,
                        method: "GET",
                          }).then(response => {
                                        loader.hide();    
                                        for (let i = 0; i < response.content.toJSON().data.length; i++) { 
                                            vm.celebs.push(response.content.toJSON().data[i])    
                                        }
                                        vm.$refs.listView.notifyLoadOnDemandFinished();
                                        console.log("page: "+vm.page);
                                });
                    },
              },            
    };
</script>

<style scoped>
    .page{
        background-color: #f1f1f1;
    }
    .but_fotter {
        width: 100%;
        background-color: white;
        size: 22px;
    }
    .item_template{
        margin: 5 5 0 5;
    }    
    .item_image{
        width:100%; 
        border-radius:10 10 0 0; 
        }
    .image_header{
        width:100%; 
        }        

    .name_header{
        margin-top: 5px;
        color: #FFF; 
        font-size: 18px;  
        margin-left: 140;
    }        
    .cats_header{
        margin-top: 25px;
        color: #FFF; 
        font-size: 12px;  
        margin-left: 140;
    }        
    .item_ago{
        margin-top: 5px;
        margin-left: 5px;
        color: #FFF; 
        font-size: 12px;  
    }
    .item_artistname{
        color: #000; 
        font-size: 18px;
        margin-top: 10;  
        margin-left: 5px;
    }
    .item_description{
        color: #000; 
        font-size: 11px;
        margin-top: 2px;  
    }
    .avatar{
      background-color: #ffffff;
      width: 40;
      height: 40;
      margin-right: 5;
    }

    .circle-wrapper{
      background-color: #666666;
      border-radius: 50%;
      width: 100%;
      height: 100%;
    }    
</style>
