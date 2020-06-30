var app = new Vue({
    el: '#employee-weekly-entry',
    data: {
        loading: true,
        weeklyDatePicker: '',
        week: '',
        mon: '',
        tue: '',
        wed: '',
        thu: '',
        fri: '',
        sat: '',
        sun: '',
        mobileView: false,
        showView: 'mon',
        days: [
            "sun",
            "mon",
            "tue",
            "wed",
            "thu",
            "fri",
            "sat"
        ],
        data: {},
        total: {}
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
                this.showView = moment(new Date()).format("ddd").toLowerCase();
            } else if (w < 960) {
                this.mobileView = true;
                this.showView = moment(new Date()).format("ddd").toLowerCase();
            } else if (w < 1200) {
                this.mobileView = false;
            } else {
                this.mobileView = false;
            }
        },
        showViewFn: function (day) {
            return !this.mobileView || this.showView == day;
        },
        changeView: function (day) {
            this.showView = day;
            this.data = JSON.parse(JSON.stringify(this.data));
        },
        addEvent({ type, target }) {
            this.loading = false;
            this.data[target.dataset.day][target.dataset.key] = target.value;
            this.calculateTotal(target.dataset.day);
        },
        calculateTotal: function (day) {
            var data = JSON.parse(JSON.stringify(this.data));
            var total = 0.0;
            Object.keys(data[day]).forEach(function (key) {
                total = total + parseFloat(data[day][key]);
            });
            var md = moment.duration(total, 'hours');
            var s = (md._data.hours > 0) ? md._data.hours + "h " : "";
            s = s.concat((md._data.minutes > 0) ? md._data.minutes + "m " : "");
            this.total[day] = s;
            this.$forceUpdate();
        }
    },
    mounted() {
        this.days.forEach(d => {
            this.data[d] = {
                al: 0,
                d123: 0,
                g45: 0
            };
            this.total[d] = 0;
        });
        this.data.wed.al = 8;
        this.data.fri.d123 = 4.5;
        this.data.tue.d123 = 4.5;
        this.data.tue.g45 = 3.5;
        this.data.thu.g45 = 8;
        this.data.fri.g45 = 2.5;
        this.weeklyDatePicker = moment(new Date()).format("YYYY-MM-DD")
        this.dateloader()
        this.winWidth()
        this.days.forEach(d => {
            this.calculateTotal(d)
        });
        this.loading = false;
    }
});