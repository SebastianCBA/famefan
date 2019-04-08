<template>
    <Page actionBarHidden="true" class="page">
        
            <GridLayout rows="60,*,60">        
                <StackLayout row="0" orientation="horizontal" >
                    <GridLayout columns="*, *, *">
                    <Label class="log-ttl-int" horizontalAlignment="left" row="0" col="0" width="33%">
                        <Span text="Home" fontAttributes="Bold" />
                    </Label>                 
                    <Button class="log-bt log-bt-azul"  :isEnabled="all" @tap="set_all()" row="0" col="1" width="33%">
                        <FormattedString>
                            <Span class="fa">{{'fa-podcast' | fonticon}}</Span>
                            <Span text="All"></Span>
                        </FormattedString>
                    </Button>
                    <Button class="log-bt log-bt-azul"  :isEnabled="myfeed" @tap="set_myfeed()" row="0" col="2" width="33%">
                        <FormattedString>
                            <Span class="fa">{{'fa-home' | fonticon}}</Span>
                            <Span text="My Feed"></Span>
                        </FormattedString>
                    </Button>                       
                    </GridLayout>
                </StackLayout>      
              <RadListView class="back-gris" row="1" ref="listView" for="item in itemList" 
                            loadOnDemandMode="Auto" 
                            @loadMoreDataRequested="onLoadMoreData">
                                          
                <v-template>
                    <StackLayout v-show="item.show == 1" orientation="vertical"  class="item_template" >
                        <AbsoluteLayout>                        
                            <Image @tap="openPopup(item.id)" ref="btn" class="item_image" v-show="item.source_id != 4 && !(item.post_image_remote === undefined) && item.post_image_remote.length > 5" :src="item.post_image_remote"/>
                            <Image @tap="openPopup(item.id)" ref="btn" class="item_image" v-show="item.source_id == 4 && !(item.videoid === undefined)" :src="'https://img.youtube.com/vi/'+item.videoid+'/0.jpg'"/>

                            <StackLayout>
                                <Label class="item_ago" :text="item.source_name+' '+item.ago"/> 
                            </StackLayout>      
                        </AbsoluteLayout>                      
                        <GridLayout columns="auto, *, 20, 20, 20, 20, 20, 20" rows="auto, *" class="item_template item_description">
                            <StackLayout class="avatar" @tap="gotoartist(item.celebrity_id)">
                                <Image  class="circle-wrapper" :src="'https://www.famefan.com/images/size/60/'+item.profile_picture"/>
                            </StackLayout>                            
                            
                            <Label row="0" col="1" class="item_artistname" :text="item.name" @tap="gotoartist(item.celebrity_id)"/>
                            <Label row="0" col="2" class="item_artistname zmdi" @tap="like(item.id)">{{'zmdi-star-outline' | fonticon}}</Label>
                            <Label v-show="item.likes > 0" row="0" col="3" class="item_artistname" :text="item.likes"/>
                            <Label row="0" col="4" class="item_artistname fa">{{'fa-comment' | fonticon}}</Label>
                            <Label row="0" col="6" class="item_artistname fa" @tap="share(item.post_link, item.post_title)">{{'fa-share' | fonticon}}</Label>
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
import Vue from "nativescript-vue";
import * as http from "http";
import { ItemEventData, ListView } from "tns-core-modules/ui/list-view";
import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout";
import * as SocialShare from "nativescript-social-share";
import { Popup } from 'nativescript-popup';
import Post from "./Post";

var PostComponentClass = Vue.extend(Post);
var LoadingIndicator = require("nativescript-loading-indicator").LoadingIndicator;
var loader = new LoadingIndicator();


//const api = 'https://www.famefan.com/api/home/'+global.uid;


    export default {
            components: {
                Post
            },        
            data() {
                return {
                  page: 1,
                  all: false,
                  myfeed: true,
                  itemList: [],
                  listView: false,
                  url: global.server+'api/home/'+global.uid,
                  popup: Popup,
                  cambia: null
                };
            },
            mounted(){
                loader.show();
                this.mountPost();
                this.listView = this.$refs.listView.nativeView;
                if(global.my_feed == 0)
                    {
                    this.infiniteHandler();
                    console.log('active home');    
                    }
                    else
                    {
                    console.log('active myfeed');    
                    global.my_feed = 1;    
                    this.set_myfeed();    
                    }

                console.log('home mounted');
            },
            beforeDestroy() {
                this.desotryPost();
            },              
            methods: {
                mountPost() {
                    if (!this.$data.postComponent) {
                        this.$data.postComponent = new PostComponentClass();
                        this.$data.postComponent.$mount();
                    }
                },
                destroyPost() {
                    if (this.$data.postComponent) {
                        this.$data.postComponent.$destroy();
                    }
                },  
                _showPopup(source, view) {
                this.popup = new Popup({
                    height: 90,
                    width: 90,
                    unit: "%",
                    elevation: 10,
                    borderRadius: 25
                });
                if (view.parent) {
                    view.parent._removeView(view);
                }

                this.popup
                    .showPopup(source, view)
                    .then(data => {
                        console.log("aaaa", data);
                    })
                    .catch(error => {
                        console.log("aaaa", error);
                    });
            },                              
                _showPopup(source, view) {

                    this.popup = new Popup({
                        height: 90,
                        width: 90,
                        unit: "%",
                        elevation: 10,
                        borderRadius: 25
                    });
                    
                    
                    if (view.parent) {
                        view.parent._removeView(view);
                        console.log('removeview');

                    }
                    this.popup
                        .showPopup(source, view)
                        .then(data => {
                            console.log("close", data);
                        })
                        .catch(error => {
                            console.log("error", error);
                        });
                },          
                openPopup(id) {
                    this.$data.postComponent.setdata(id);
                    /*this.cambia = id;
                        let originalList = this.itemList;
                        let i;
                        for(i = 0; i < originalList.length; i++)
                            {
                            if(originalList[i].id == this.cambia)
                                {
                                this.$data.postComponent.setdata(originalList[i]);
                                console.log('actualicen');
                                i = originalList.length;
                                }
                            }   */                                          
                    this._showPopup(
                        this.$refs.btn.nativeView,
                        this.$data.postComponent.$el.nativeView
                    );
                    
                },                      

                share(url, title){
                    console.log(url);
                    console.log(title);
                    SocialShare.shareUrl(url, title);
                },
                like(id){
                   console.log(id);
                   this.count = this.count + 1;
                   http.request({
                        url: global.server+'/api/post/like/'+global.uid+'/'+id,
                        method: "GET",
                          }).then(response => {
                                let originalList = this.itemList;
                                console.log(originalList.length);
                                console.log(id);
                                let i;
                                    for(i = 0; i < originalList.length; i++){
                                        if(originalList[i].id == id)
                                            {
                                            originalList[i].likes = originalList[i].likes + 1;
                                            }
                                        
                                        //console.log(this.celebs[i].user_id);
                                        }  
                                });                    
                },
                onLoaded(args) {
                    var listView = args.object;
                    listView.loadOnDemandMode = "Manual";
                    listView.loadOnDemandItemTemplate = `<GridLayout height="100" backgroundColor="red"></GridLayout>`;
                },                
                gotoartist(id)
                {
                  global.artist_id = id;  
                  console.log(id);
                  this.$goto('artist');                    
                },
                set_myfeed(){
                    loader.show();
                    this.url = global.server+'api/myfeed/'+global.uid;
                    this.all = true;
                    this.myfeed = false;
                    this.itemList = [];
                    this.infiniteHandler();
                    loader.hide();
                },  
                set_all(){
                    loader.show();
                    this.url = global.server+'api/home/'+global.uid;
                    this.all = false;
                    this.myfeed = true;
                    this.itemList = [];
                    this.infiniteHandler();
                    loader.hide();
                },                    
                onLoadMoreData(){
                    this.listView.loadOnDemandItemTemplate = '<GridLayout height="100" backgroundColor="red"></GridLayout>';                    
                    this.infiniteHandler();
                    this.page = this.page + 1;
                },
                infiniteHandler() {
                  console.log('start infinite');
                  let vm = this;
                  console.log(this.url+'?page='+vm.page);  
                  http.request({
                        url: this.url+'?page='+vm.page,
                        method: "GET",
                          }).then(response => {
                                        //console.log(response);
                                        loader.hide();    
                                        for (let i = 0; i < response.content.toJSON().data.length; i++) { 
                                            console.log(response.content.toJSON().data[i].comments);
                                            vm.itemList.push(response.content.toJSON().data[i])    
                                        }
                                        vm.$refs.listView.notifyLoadOnDemandFinished();
                                        
                                }, error => { console.log(error);}   );
                    },
              },            
    };
</script>

