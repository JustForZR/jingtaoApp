var phoneWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
var phoneHeight = (window.innerHeight > 0) ? window.innerHeight : screen.height;
var scale = window.innerWidth / screen.width;
scale = scale ? scale : 1;
$('html').css('font-size', 100 * scale + 'px');

var jingtaoApp = angular.module('jingtaoApp', ["ui.router", "ngAnimate", 'mgcrea.ngStrap', 'ngTouch']);
jingtaoApp.config(function($urlRouterProvider, $stateProvider, $httpProvider) {
    $httpProvider.defaults.headers.post = { 'Content-Type': 'application/x-www-form-urlencoded' };
    //设置默认显示路由界面
    $urlRouterProvider.otherwise("/searchSmell");
    var states = [{
        name: 'searchSmell',
        url: '/searchSmell',
        templateUrl: 'searchSmell.html',
        cache: true
    }, {
        name: 'find',
        url: '/find',
        templateUrl: 'find.html',
        cache: true
    }, {
        name: 'specialtySort',
        url: '/specialtySort',
        templateUrl: 'specialtySort.html'
    }, {
        name: 'shoppingCart',
        url: '/shoppingCart',
        templateUrl: 'shoppingCart.html'
    }, {
        name: 'personalCenter',
        url: '/personalCenter',
        templateUrl: 'personalCenter.html'
    }];

    states.forEach(function(state) {
        $stateProvider.state(state);
    });
})
jingtaoApp.directive('chinaMap',function(){
    return {
        restrict:'EA',
        template:'<div class="map">123123</div>',
        replace:true,
    }
})
jingtaoApp.controller('jingtaoCtrl', function() {
    //  stateTo: function (navItem) {
    //     $state.go(navItem.UiSerf);
    // },
});

/*************************************************************寻味模块**********************************************************/

jingtaoApp.controller("searchSmellCtrl", function($scope, $http, $modal) {

        var storeWrapper = new Swiper(".swiper-storeContainer", {
            freeMode: true,
            observer: true, //修改swiper自己或子元素时，自动初始化swiper
            observeParents: true, //修改swiper的父元素时，自动初始化swiper
            slidesPerView: "auto",
        });

        //angularstrap模态框
        var showStoreModal = $modal({ scope: $scope, templateUrl: 'storeModal.html', show: false });

        //控制省份的宽高
        $(".place_detail").css({ "height": (phoneWidth * 0.344 - 65) - (phoneWidth * 0.344 - 65) % 15 });

        //滚动事件隐藏header
        var firstWrapper = new IScroll('.firstWrapper', { probeType: 3, mouseWheel: true });
        var scrollHeight = $(".map").height() + 30;
        firstWrapper.flag = true;
        firstWrapper.on('scroll', function() {
            if(this.y <= -scrollHeight) {
                $(".header").css({ "top": (this.y + scrollHeight) });
            } else {
                $(".header").css({ "top": 0 });
            };
            if(this.y <= -$(".map").height()) {
                while(firstWrapper.flag) {
                    $(".otherHeader").slideDown();
                    $('.otherHeader').animate({ top: -10 }, 100);
                    $('.otherHeader').animate({ top: 0 }, 50);
                    firstWrapper.flag = false;
                }
            } else {
                firstWrapper.flag = true;
                $(".otherHeader").slideUp();
            }
        })

        //地图下拉事件        
        var mapHeight;
        $(".downMenu").swipe({
            swipeStatus: function(event, phase, direction, distance, duration, fingerCount, fingerData) {
                if(phase === "start") {
                    mapHeight = parseInt($(".otherMap").height());
                } else {
                    if(distance > $(".map").height()) {
                        return null;
                    } else {
                        if(direction === "down") {
                            $(".otherMap").css({'display':'block'});
                            $(".otherMap").height(mapHeight + distance);
                        } else {
                            $(".otherMap").height(mapHeight - distance);
                        }
                    }
                }
            },
            threshold: 0,
            fingers: 'all'
        });



        var search = {
            phoneHeight: phoneHeight + 'px',
            getDatas: function() {
                $http({
                        url: 'http://api.ub33.cn/api/IndexNController/getProvincialInformationAndCities',
                        method: 'post',
                        data: $.param({ pID: 31 })
                    })
                    .then(function success(response) {
                        console.log(response.data);
                        // 所有城市介绍
                        $scope.search.placeHeight = phoneWidth * 0.00344 + 'rem';

                        $scope.search.shengName = response.data.provinceAry.region_name;
                        $scope.search.shengIntroduce = response.data.provinceAry.griInfo;
                        $scope.search.shengBgPic = response.data.provinceAry.griImg;
                        $scope.search.storeList = response.data.provinceAry.citiesAry;

                        //所有店铺介绍
                        $scope.search.storeGoodsList = response.data.provinceAry.cityProduct;
                        if ($scope.search.storeList.length === 1) {
                            $scope.search.storeStyle = { 'width': (phoneWidth - 26) / 100 + 'rem' };
                            $scope.search.storeImgStyle = { 'height': (phoneWidth - 26) * 0.0064 + 'rem' }
                        } else {
                            $scope.search.storeStyle = { 'width': (phoneWidth - 50) / 100 + 'rem' };
                            $scope.search.storeImgStyle = { 'height': (phoneWidth - 50) * 0.0064 + 'rem' }
                        }

                        var scrollHeight = $(".map").height() + 30;

                        var everything = new Array();
                        setTimeout(function() {
                            for (var i = 0; i < response.data.provinceAry.cityProduct.length; i++) {
                                everything[i] = new Swiper(".swiper-goodsContainer" + i, {
                                    freeMode: true,
                                    slidesPerView: "auto",
                                    observer: true, //修改swiper自己或子元素时，自动初始化swiper
                                    observeParents: true, //修改swiper的父元素时，自动初始化swiper
                                });
                            }

                            $(".index_storeIntroduce  dt").css("width", (phoneWidth - $(".index_storeIntroduce dd").width() - 45));
                            firstWrapper.refresh();
                        }, 0);
                    })
            },
            showStoreModal: function() {
                showStoreModal.$promise.then(showStoreModal.show);
            }
        }
        $scope.search = search;

})
