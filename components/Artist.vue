<template>
    <Page actionBarHidden="true" class="page">
        <GridLayout rows="140,*,60">   
                <StackLayout row="0" orientation="vertical">
                    <AbsoluteLayout rows="80" width="100%">
                        <Image class="image_header" style="overflow:hidden;" :src="this.server+'images/'+celeb.header_picture"/>
                        <Gradient width="100%" height="80" horizontalAlignment="center" direction="to right" colors="rgba(0,0,0,255), rgba(0,0,0,255), rgba(0,0,0,1)"/>
                        <Label class="name_header" :text="celeb.name"/> 
                        <Label class="cats_header" :text="celeb.cats"/> 
                        <StackLayout style="margin-top:80;"  horizontalAlignment="center" orientation="horizontal">
                            <Button>Boton1</Button>
                            <Button>Boton2</Button>
                            <Button>Boton3</Button>
                        </StackLayout>                        
                    </AbsoluteLayout> 
                </StackLayout>      
              <RadListView row="1" ref="listView" for="item in itemList" 
                            loadOnDemandMode="Auto" 
                            @loadMoreDataRequested="onLoadMoreData">
                                          
                <v-template>
                    <StackLayout v-show="item.show == 1" orientation="vertical"  class="item_template">
                        <AbsoluteLayout>                        
                            <Image class="item_image" v-show="!(item.post_image_remote === undefined) && item.post_image_remote.length > 5" :src="item.post_image_remote"/>
                            <StackLayout>
                                <Label class="item_ago" :text="item.source_name+' '+item.ago"/> 
                            </StackLayout>      
                        </AbsoluteLayout>                      
                        <GridLayout columns="auto, *, 20, 20, 20" rows="auto, *" class="item_template">
                            <StackLayout class="avatar" @tap="gotoartist(item.celebrity_id)">
                                <Image  class="circle-wrapper" :src="'https://www.famefan.com/images/size/60/'+item.profile_picture"/>
                            </StackLayout>                            
                            
                            <Label row="0" col="1" class="item_artistname" :text="item.name"/>
                            <Label row="0" col="2" class="item_artistname zmdi zmdi-hc-lg">{{'zmdi-star-outline' | fonticon}}</Label>
                            <Label row="0" col="3" class="item_artistname fa">{{'fa-comment' | fonticon}}</Label>
                            <Label row="0" col="4" class="item_artistname fa">{{'fa-share' | fonticon}}</Label>
                            <TextView v-show="item.source_id != 4" row="1" colSpan="5" class="item_description" :text="item.post_description"/>
                            <TextView v-show="item.source_id == 4" row="1" colSpan="5" class="item_description" :text="item.post_title"/>
                        </GridLayout>                            
                    </StackLayout>    
                </v-template>
              </RadListView>
            <StackLayout row="2" orientation="horizontal" style="background-color: #FFF">
                <Button textWrap="true" class="but_fotter" textAlignment="text">
                    <FormattedString>
                        <Span class="far">{{'fa-calendar' | fonticon}}</Span>
                        <Span text="Feed"></Span>
                    </FormattedString>
                </Button>
                <Button textWrap="true" class="but_fotter" textAlignment="text">
                    <FormattedString>
                        <Span class="fa">{{'fa-search' | fonticon}}</Span>
                        <Span text="Buscar"></Span>
                    </FormattedString>
                </Button>
                <Button textWrap="true" class="but_fotter" textAlignment="text">
                    <FormattedString>
                        <Span class="far">{{'fa-sun' | fonticon}}</Span>
                        <Span text="My Celeb"></Span>
                    </FormattedString>
                </Button>
                <Button textWrap="true" class="but_fotter" textAlignment="text">
                    <FormattedString>
                        <Span class="far">{{'fa-user' | fonticon}}</Span>
                        <Span text="My Account"></Span>
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
                  page: 1,
                  itemList: [],
                  celeb:[],
                  server: global.server,
                  url_celeb: global.server+'/api/artist/'+global.artist_id,
                  url_posts: global.server+'/api/artist/'+global.artist_id+'/posts/'+global.uid,//+global.artist_id,
                };
            },
            mounted(){
                  let vm = this;
                  http.request({
                        url: vm.url_celeb,
                        method: "GET",
                          }).then(response => {
                                        //console.log(response.content.toJSON());
                                        vm.celeb = response.content.toJSON();
                                });    
                  http.request({
                        url: vm.url_posts,
                        method: "GET",
                          }).then(response => {
                                        for (let i = 0; i < response.content.toJSON().data.length; i++) { 
                                            vm.itemList.push(response.content.toJSON().data[i])    
                                        }
                                        vm.$refs.listView.notifyLoadOnDemandFinished();
                                        vm.page = vm.page + 1;
                                });                                                
            },  
            methods: {
                gotoartist(id)
                {
                  global.artist_id = id;  
                  console.log(id);
                  loader.show();
                  this.$goto('artist');                    
                },
                set_myfeed(){
                    loader.show();
                    this.url = global.server+'/api/myfeed/'+global.uid;
                    this.all = true;
                    this.myfeed = false;
                    this.itemList = [];
                    this.infiniteHandler();
                    loader.hide();
                },  
                set_all(){
                    loader.show();
                    this.url = global.server+'/api/home/'+global.uid;
                    this.all = false;
                    this.myfeed = true;
                    this.itemList = [];
                    this.infiniteHandler();
                    loader.hide();
                },                    
                onLoadMoreData(){
                    this.infiniteHandler();
                    this.page = this.page + 1;
                },
                infiniteHandler() {
                  console.log('start infinite');
                  let vm = this;

                  http.request({
                        url: this.url+'?page='+vm.page,
                        method: "GET",
                          }).then(response => {
                                        loader.hide();    
                                        for (let i = 0; i < response.content.toJSON().data.length; i++) { 
                                            vm.itemList.push(response.content.toJSON().data[i])    
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
        width: 25%;
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
        font-size: 14px;
        font-weight: bold;
        margin-top: 6px;  
    }
    .item_description{
        color: #000; 
        font-size: 11px;
        margin-top: 2px;  
    }
    .avatar{
      background-color: #ffffff;
      width:40;
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
