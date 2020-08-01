var app = new Vue({
    el: '#report',
    data: {
        loading: false,
        weeklyDatePicker: '',
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
        total: 0,
        tasksId: [],
        tasks: {},
        selectedTasks: {},
        entries: [],
        dropdowntasks: [],
        dropdownprojects: [],
        dropdownemployees: [],
        dropdownprojectsname: [],
        dropdowntasksname: [],
        dropdownemployeesname: [],
        selectedproject: null,
        selectedtask: null,
        selectedemployee: [],
        week: {}
    },
    components: {
        Multiselect: window.VueMultiselect.default
    },
    methods: {
        dateloader: function() {
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
        },
        calcEntries: function() {
            this.days.forEach(d => {
                this.dayEntries[d].tasks = {};
                this.tasksId.forEach(t => {
                    this.entries.forEach(e => {
                        if (e.entry_date.substring(0, 10) == this.dayEntries[d].date && e.task_id == t) {
                            this.dayEntries[d].tasks[t] = e;
                        }
                    })
                });
            });
            this.calculateTotal();
        },
        calculateTotal: function() {
            this.selectedemployee.forEach(emp => {
                this.selectedTasks[emp].forEach(t => {
                    this.days.forEach(d => {
                        if (this.dayEntries[d].tasks[t])
                            this.total += this.dayEntries[d].tasks[t].minutes / 60;
                    })

                })
            })
            console.log(this.total)
            this.loading = true;
        },
        previousweek() {
            this.loading = false;
            var current = new Date(this.weeklyDatePicker)
            var first = current.getDate() - current.getDay() + 1;
            var last = first - 6;

            this.weeklyDatePicker = moment(new Date(current.setDate(last))).format("YYYY/MM/DD");
            this.dateloader();
            this.filter();
        },
        nextweek() {
            this.loading = false;
            var current = new Date(this.weeklyDatePicker)
            var first = current.getDate() - current.getDay() + 1;
            var last = first + 6;

            this.weeklyDatePicker = moment(new Date(current.setDate(last))).format("YYYY/MM/DD");
            this.dateloader();
            this.filter();
        },
        getReportDropdowns() {
            axios.get('http://localhost:9000/report/get_dropdowns')
                .then(response => {
                    const data = response.data
                    console.log(data)
                    if (data) {
                        this.dropdownprojects = [...data["project"]]
                        this.dropdowntasks = [...data["task"]]
                        this.dropdownemployees = [...data["employee"]]
                        for (i = 0; i < this.dropdownprojects.length; i++) {
                            this.dropdownprojectsname[i] = Object.values(this.dropdownprojects[i])[1];
                        }
                        for (i = 0; i < this.dropdowntasks.length; i++) {
                            this.dropdowntasksname[i] = Object.values(this.dropdowntasks[i])[1];
                        }
                        for (i = 0; i < this.dropdownemployees.length; i++) {
                            this.dropdownemployeesname[i] = Object.values(this.dropdownemployees[i])[1];
                        }
                    }
                    this.loading = true;
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
            this.loading = false;
            this.week.fromdate = moment(new Date(this.weeklyDatePicker)).day(0).format();
            this.week.todate = moment(new Date(this.weeklyDatePicker)).day(6).format();
            var projectid
            this.dropdownprojects.forEach(t => {
                if (this.selectedproject == Object.values(t)[1]) {
                    projectid = Object.values(t)[0]
                }
            })
            axios.post('http://localhost:9000/task/get_project_task_by_week/' + projectid, this.week)
                .then(response => {
                    this.tasks = {};
                    if (response.data.Tasks != null) {
                        response.data.Tasks.forEach(r => {
                            this.tasks[r.task_id] = r
                            this.tasksId.push(r.task_id)
                        })
                        this.$swal({
                            title: "Tasks found",
                            text: "Project Tasks fetched!",
                            icon: "success",
                            buttons: false,
                            timer: 2000,
                        })
                    } else {
                        this.$swal({
                            title: "No Tasks found",
                            text: " No Project Tasks fetched!",
                            icon: "error",
                            buttons: false,
                            timer: 2000,
                        })
                    }
                    // console.log(this.tasks)
                }).catch(error => { console.log(error); });
            axios.post('http://localhost:9000/entry/get_project_entry_by_week/' + projectid, this.week)
                .then(response => {
                    this.entries = [];
                    if (response.data.Entries != null) {
                        response.data.Entries.forEach(r => {
                            this.entries[r.entry_id] = r
                        })
                    }
                    if (this.selectedemployee.length == 0) {
                        Object.values(this.tasks).forEach(t => {
                            t.assignees.forEach(a => {
                                if (!this.selectedemployee.includes(a)) {
                                    this.selectedemployee.push(a)
                                }
                            })
                        })
                    }
                    this.selectedTasks = {};

                    // console.log(this.selectedTasks)
                    if (this.selectedtask != null) {
                        var taskid
                        this.dropdowntasks.forEach(t => {
                            if (this.selectedtask == Object.values(t)[1]) {
                                taskid = Object.values(t)[0]
                            }
                        })
                        this.selectedemployee.forEach(emp => {
                            this.selectedTasks[emp] = [];
                            Object.values(this.tasks).forEach(t => {
                                if (t.assignees.includes(emp) && t.task_id == taskid) {
                                    this.selectedTasks[emp].push(t.task_id)
                                }
                            })
                        })
                    } else {
                        this.selectedemployee.forEach(emp => {
                            this.selectedTasks[emp] = [];
                            Object.values(this.tasks).forEach(t => {
                                if (t.assignees.includes(emp)) {
                                    this.selectedTasks[emp].push(t.task_id)
                                }
                            })
                        })
                    }
                    this.calcEntries();
                }).catch(error => { console.log(error); });
        },
        // istasks: function(employeename) {
        //     return this.selectedTasks[employeename].length == 0 ? true : false;
        // }
    },
    created() {
        this.getReportDropdowns();
        this.weeklyDatePicker = moment(new Date()).format("YYYY-MM-DD");
        this.dateloader();
    }
});