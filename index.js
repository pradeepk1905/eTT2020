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
        total: {},
        currentTask: {
            desc: "",
            hours: 0
        },
        entries: [],
        selectedTasks: [
            1, 124, 235
        ],
        project: [
            "Leave",
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
            this.calcEntries();
        },
        calcEntries: function () {
            this.days.forEach(d => {
                this.dayEntries[d].tasks = {};
                this.selectedTasks.forEach(t => {
                    this.entries.forEach(e => {
                        if (e.date == this.dayEntries[d].date && e.task == t) {
                            this.dayEntries[d].tasks[t] = e;
                        }
                    })
                });
                this.calculateTotal(d);
            });
        },
        openDetailsModal: function (day, tid) {
            const task = this.getTask(day, tid);
            if (task) {
                this.currentTask = task;
                new bootstrap.Modal(document.getElementById('exampleModal'), {}).show();
            }
        },
        getTask: function (day, tid) {
            return (this.dayEntries[day].tasks && this.dayEntries[day].tasks[tid]) ? this.dayEntries[day].tasks[tid] : undefined;
        },
        getHours: function (day, tid) {
            return (this.dayEntries[day].tasks && this.dayEntries[day].tasks[tid]) ? this.dayEntries[day].tasks[tid].hours : 0;
        },
        getStatus: function (day, tid) {
            return (this.dayEntries[day].tasks && this.dayEntries[day].tasks[tid]) ? this.dayEntries[day].tasks[tid].status : 'pending';
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
        },
        addEvent({ type, target }) {
            this.loading = false;
            var val = -1;
            if (parseFloat(target.value) >= 0) {
                val = target.value
            } else if (target.value == "") {
                val = 0;
            }
            if (val >= 0) {
                if (val > 0 && !this.dayEntries[target.dataset.day].tasks[target.dataset.key]) {
                    //create new entry and process
                    const entry = {
                        hours: val,
                        desc: '',
                        date: this.dayEntries[target.dataset.day].date,
                        task: target.dataset.key,
                        fromTime: moment().format("HH:mm"),
                        toTime: moment().add(val, 'h').format("HH:mm")
                    };
                    this.dayEntries[target.dataset.day].tasks[target.dataset.key] = entry;
                    this.entries.push(entry);
                } else if (val >= 0 && this.dayEntries[target.dataset.day].tasks[target.dataset.key]) {
                    //update existing entry
                    this.dayEntries[target.dataset.day].tasks[target.dataset.key].hours = val;
                    this.entries.forEach((e, index, object) => {
                        if (e.task == target.dataset.key && e.date == this.dayEntries[target.dataset.day].date) {
                            if (val == 0) {
                                object.splice(index, 1);
                                this.dayEntries[target.dataset.day].tasks[target.dataset.key] = undefined;
                            } else {
                                e.hours = val;
                                e.fromTime = moment().format("HH:mm");
                                e.toTime = moment(e.fromTime, "HH:mm").add(val, 'h').format("HH:mm")
                            }
                        }
                    });
                }
                this.calculateTotal(target.dataset.day);
            }
        },
        addModalEvent: function () {
            this.entries.forEach(e => {
                if (e.date == this.currentTask.date && e.task == this.currentTask.task) {
                    e = this.currentTask;
                    e.toTime = moment(e.fromTime, "HH:mm").add(e.hours, 'h').format("HH:mm")
                }
            });
            this.dateloader();
        },
        openTasksModal: function () {
            new bootstrap.Modal(document.getElementById('tasksModal'), {}).show();
        },
        calculateTotal: function (day) {
            var data = JSON.parse(JSON.stringify(this.dayEntries));
            var total = 0.0;
            Object.keys(data[day].tasks).forEach(function (key) {
                if (parseFloat(data[day].tasks[key].hours) > 0)
                    total = +(total + parseFloat(data[day].tasks[key].hours));
            });
            var md = moment.duration(total, 'hours');
            var s = (md._data.hours > 0) ? md._data.hours + "h " : "";
            s = s.concat((md._data.minutes > 0) ? md._data.minutes + "m " : "");
            this.total[day] = s;
            this.$forceUpdate();
            localStorage.setItem("dayEntries", JSON.stringify(data));
            localStorage.setItem("entries", JSON.stringify(this.entries));
            this.loading = false;
        },
        showTask: function (p, tid, t) {
            return t.project == p && !this.selectedTasks.includes(+tid);
        },
        addTask: function (tid, t) {
            this.selectedTasks.push(tid);
            this.$forceUpdate();
            bootstrap.Modal.getInstance(document.getElementById('tasksModal')).hide()
        }
    },
    mounted() {
        if (localStorage.getItem("entries") == undefined) {
            this.entries = [
                {
                    date: moment(new Date()).format("YYYYMMDD"), hours: 8, desc: "", task: 1,
                    fromTime: moment("09:00", "HH:mm").format("HH:mm"), toTime: moment("09:00", "HH:mm").add(8, 'h').format("HH:mm")
                },
                {
                    date: moment(new Date()).subtract(1, 'd').format("YYYYMMDD"), hours: 3.5, desc: "", task: 124, status: 'rejected',
                    fromTime: moment("09:00", "HH:mm").format("HH:mm"), toTime: moment("09:00", "HH:mm").add(3.5, 'h').format("HH:mm")
                },
                {
                    date: moment(new Date()).add(1, 'd').format("YYYYMMDD"), hours: 4.5, desc: "", task: 235, status: 'approved',
                    fromTime: moment("09:00", "HH:mm").format("HH:mm"), toTime: moment("09:00", "HH:mm").add(4.5, 'h').format("HH:mm")
                }
            ];
        } else {
            this.entries = JSON.parse(localStorage.getItem("entries"));
        }
        this.weeklyDatePicker = moment(new Date()).format("YYYY-MM-DD")
        this.dateloader()
        this.winWidth()
    }
});