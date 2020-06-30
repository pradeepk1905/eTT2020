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
        showTasks: {},
        mobileView: false,
        showView: 'mon',
        dayEntries: {},
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
        total: {},
        entries: [
            { date: "20200630", hours: 8, desc: "", task: 1 },
            { date: "20200629", hours: 3.5, desc: "", task: 124 },
            { date: "20200629", hours: 4.5, desc: "", task: 235 }
        ],
        selectedTasks: [
            1, 124, 235
        ],
        project: [
            "Leave",
            "GMOne",
            "DCF"
        ],
        tasks: {
            1: { project: "Leave", title: "Annual Leave" },
            2: { project: "Leave", title: "Sick Leave" },
            3: { project: "Leave", title: "Casual Leave" },
            123: { project: "GMOne", title: "GSO-123 Sample gmone task 1" },
            124: { project: "GMOne", title: "GSO-124 Sample gmone task 2" },
            125: { project: "GMOne", title: "GSO-125 Sample gmone task 3" },
            233: { project: "DCF", title: "DCF-233 Sample dcf  ticket 3" },
            234: { project: "DCF", title: "DCF-234 Sample dcf  ticket 4" },
            235: { project: "DCF", title: "DCF-235 Sample dcf  ticket 5" }
        }
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
            this.dayEntries = {};
            for (let i = 0; i < 7; i++) {
                const d = moment(new Date(this.weeklyDatePicker)).day(i);
                this.dayEntries[d.format("ddd").toLowerCase()] = {
                    date: d.format("YYYYMMDD"),
                    day: d.format("ddd").toLowerCase(),
                    date_f: d.format("MM/DD")
                };
            }

            console.log(this.dayEntries);
            this.calcEntries();
        },
        calcEntries: function () {
            this.days.forEach(d => {
                console.log(this.dayEntries[d]);
                this.selectedTasks.forEach(t => {
                    this.entries.forEach(e => {
                        this.dayEntries[d].tasks = {};
                        if (e.date == this.dayEntries[d].date) {
                            this.dayEntries[d].tasks[t] = e;
                        }
                    })
                });
                //this.total[d] = 0;
            });
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
            this.data[target.dataset.day][target.dataset.key].val = target.value;
            this.calculateTotal(target.dataset.day);
        },
        openTasksModal: function () {
            new bootstrap.Modal(document.getElementById('tasksModal'), {}).show();
        },
        calculateTotal: function (day) {
            var data = JSON.parse(JSON.stringify(this.data));
            var total = 0.0;
            Object.keys(data[day]).forEach(function (key) {
                if (parseFloat(data[day][+key].val) > 0)
                    total = +(total + parseFloat(data[day][+key].val));
            });
            var md = moment.duration(total, 'hours');
            var s = (md._data.hours > 0) ? md._data.hours + "h " : "";
            s = s.concat((md._data.minutes > 0) ? md._data.minutes + "m " : "");
            this.total[day] = s;
            this.$forceUpdate();
        },
        toggleTasks: function (p) {
            this.showTasks[p] = !this.showTasks[p];
            this.$forceUpdate();
        },
        showTask: function (p, tid, t) {
            return t.project == p && !this.selectedTasks.includes(+tid);
        },
        addTask: function (tid, t) {
            this.days.forEach(d => {
                this.data[d][tid] = { val: 0, status: "pending" }
            });
            this.selectedTasks.push(tid);
            this.$forceUpdate();
            console.log(bootstrap.Modal.getInstance(document.getElementById('tasksModal')).hide())
        },
        getTask: function (tId) {
            this.selectedTasks.push(tId);
        },
    },
    mounted() {
        this.days.forEach(d => {
            this.data[d] = {
                0: {}
            };
            this.selectedTasks.forEach(t => {
                this.data[d][t] = { val: 0, status: "pending" }
            });
            this.total[d] = 0;
        });
        this.project.forEach(p => {
            this.showTasks[p] = false;
        });
        this.weeklyDatePicker = moment(new Date()).format("YYYY-MM-DD")
        this.dateloader()
        this.winWidth()
        this.days.forEach(d => {
            this.calculateTotal(d)
        });
        this.loading = false;
    }
});