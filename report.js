var app = new Vue({
    el: '#report',
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
        total: 200,
        selectedTasks: [],
        tasks: {},
        entries: [],
        dropdowntasks: [],
        dropdownprojects: [],
        dropdownemployees: [],
        selectedproject: 'Project',
        selectedtask: 'Ticket',
        selectedemployee: 'Employee'
    },
    methods: {
        dateloader: function() {
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
                    date: d.format("YYYY-MM-DD"),
                    day: d.format("ddd").toLowerCase(),
                    date_f: d.format("MM/DD"),
                    date_f2: d.format()
                };
            }
            // console.log(this.tasks)
            this.calcEntries();
        },
        calcEntries: function() {
            this.days.forEach(d => {
                this.dayEntries[d].tasks = {};
                this.selectedTasks.forEach(t => {
                    this.entries.forEach(e => {
                        if (e.entry_date.substring(0, 10) == this.dayEntries[d].date && e.task_id == t) {
                            this.dayEntries[d].tasks[t] = e;
                        }
                    })
                });
                // this.calculateTotal(d);
            });
            console.log(this.dayEntries)
        },
        previousweek() {
            var current = new Date(this.weeklyDatePicker)
            var first = current.getDate() - current.getDay() + 1;
            var last = first - 6;

            this.weeklyDatePicker = moment(new Date(current.setDate(last))).format("YYYY/MM/DD");
            this.dateloader()
        },
        nextweek() {
            var current = new Date(this.weeklyDatePicker)
            var first = current.getDate() - current.getDay() + 1;
            var last = first + 6;

            this.weeklyDatePicker = moment(new Date(current.setDate(last))).format("YYYY/MM/DD");
            this.dateloader()
        },
        getReportDropdowns() {
            axios.get('http://localhost:9000/report/get_dropdowns')
                .then(response => {
                    const data = response.data
                        //console.log(data)
                    if (data) {
                        this.dropdownprojects = [...data["project"]]
                        this.dropdowntasks = [...data["task"]]
                        this.dropdownemployees = [...data["employee"]]
                    }
                }).catch(error => {
                    console.log(error);
                })
        },
        getHours: function(day, tid) {
            if (this.dayEntries[day].tasks && this.dayEntries[day].tasks[tid]) {
                var mins = this.dayEntries[day].tasks[tid].minutes;
                var hours = 0.0;
                hours = mins / 60;
                if (mins % 60 != 0) {
                    x = parseFloat((mins % 60) / 60);
                    hours += x;
                }
                return hours;
            } else {
                return 0;
            }
        },
        edit: function(hours) {
            return hours != 0 ? hours + ":00" : " "
        },
        filter: function() {
            if (this.selectedemployee != 'Employee') {
                this.selectedTasks = [];
                const values = Object.values(this.tasks)
                values.forEach(t => {
                    if (t.assignees.length != 0) {
                        t.assignees.forEach(a => {
                            if (a == this.selectedemployee) {
                                this.selectedTasks.push(t.task_id)
                            }
                        })
                    }
                })
                console.log(this.selectedTasks)
            }
            if (this.selectedproject != 'Project') {
                this.selectedTasks.forEach(id => {
                    console.log(id, this.tasks[id].project, this.selectedproject)
                    if (this.tasks[id].project != this.selectedproject) {
                        this.selectedTasks.pop(id);
                    }
                })
                console.log(this.selectedTasks)
            }
            if (this.selectedtask != 'Ticket') {
                this.selectedTasks.forEach(id => {
                    console.log(this.tasks[id].summary, this.selectedtask)
                    if (this.tasks[id].summary != this.selectedtask) {
                        this.selectedTasks.pop(id);
                    }
                })
                console.log(this.selectedTasks)
            }
            this.$forceUpdate();
            this.calcEntries();
        }
    },
    created() {
        this.getReportDropdowns();
        axios.get('http://localhost:9000/task/get_all')
            .then(response => {
                if (response.data.Tasks != null) {
                    response.data.Tasks.forEach(r => {
                        this.tasks[r.task_id] = r
                    })
                }
            }).catch(error => { console.log(error); });
        axios.get('http://localhost:9000/entry/get_all')
            .then(response => {
                if (response.data.Entries != null) {
                    response.data.Entries.forEach(r => {
                        this.entries[r.entry_id] = r
                    })
                }
                this.weeklyDatePicker = moment(new Date()).format("YYYY-MM-DD");
                this.dateloader();
                this.loading = false;
            }).catch(error => { console.log(error); });
    }
});