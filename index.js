var app = new Vue({
    el: '#employee-weekly-entry',
    data: {
        weeklyDatePicker: '',
        week: '',
        mon: '',
        tue: '',
        wed: '',
        thur: '',
        fri: '',
        sat: '',
        sun: '',
        mobileView: false,
        showView: 'mon'
    },
    methods: {
        dateloader: function () {

            var current = new Date(this.weeklyDatePicker)
            var first = current.getDate() - current.getDay();
            var last = first + 6;
            var firstday = moment(new Date(current.setDate(first))).format("YYYY/MM/DD");
            var lastday = moment(new Date(current.setDate(last))).format("YYYY/MM/DD");
            this.week = firstday + " - " + lastday;
            this.week = firstday + " - " + lastday;

            this.sun = moment(new Date(current.setDate(first))).format("MM/DD");
            this.sat = moment(new Date(current.setDate(last))).format("MM/DD");
            this.mon = moment(new Date(current.setDate(first + 1))).format("MM/DD");
            this.tue = moment(new Date(current.setDate(first + 2))).format("MM/DD");
            this.wed = moment(new Date(current.setDate(first + 2))).format("MM/DD");
            this.thu = moment(new Date(current.setDate(last - 2))).format("MM/DD");
            this.fri = moment(new Date(current.setDate(last - 1))).format("MM/DD");

            //console.log(this.weeklyDatePicker)
        },
        winWidth: function () {
            var w = window.innerWidth;
            if (w < 768) {
                this.mobileView = true;
            } else if (w < 960) {
                this.mobileView = false;
            } else if (w < 1200) {
                this.mobileView = false;
            } else {
                this.mobileView = false;
            }
        },
        showViewFn: function (day) {
            return !this.mobileView || this.showView == day;
        }
    },
    mounted() {
        this.weeklyDatePicker = moment(new Date()).format("YYYY-MM-DD")
        this.dateloader()
        this.winWidth()
    }
});