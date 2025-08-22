import { createStore } from 'vuex'
import { getTasks } from '../services/api.js'

export default createStore({
    state: {
        tasks: [],
        logs: [],
        currentTask: {
            taskId: null,
            taskName: "未命名任务",
            sourceType: '',
            destinationType: ''
        },
        currentTaskStats: {
            status: 'STOPPED',
            totalRecords: 0,
            shardCount: 0,
            processedRecords: 0,
            scannedRecords: 0,
            failedShards: 0,
            completedShards: 0,
            skippedShards: 0,
            failedBatches: []
        },
        config: {
            taskId: "",
            taskName: "",
            sourceType: "",
            sourceFieldName: '',
            targetFieldName: '',
            sourceConfig: {
                url: "",
                username: "",
                password: ""
            },
            destinationType: "",
            destinationConfig: {
                clusterNodes: "",
                bootstrapServers: "",
                disableSslVerification: false,
                url: '',
                username: '',
                password: ''
            },
            syncConfig: {
                batchSize: 5000,
                minShards: 1,
                maxShards: 10,
                coordinatorType: "redis",
                coordinatorConfig: {
                    host: "",
                    port: 6379
                }
            },
            fields: [{}]
        }
    },
    mutations: {
        setTasks(state, tasks) {
            state.tasks = tasks
        },
        setCurrentTask(state, task) {
            state.currentTask = task
        },
        setCurrentTaskStats(state, task) {
            state.currentTaskStats = task
        },
        updateConfig(state, config) {
            state.config = config
        },
        updateTaskStatus(state, { taskId, status }) {
            const task = state.tasks.find(t => t.taskId === taskId)
            if (task) {
                task.status = status
            }
        },
        addLog(state, log) {
            state.logs.unshift(log)
            if (state.logs.length > 50) {
                state.logs.pop()
            }
        },
        resetConfig(state) {
            // 重置为默认配置
            state.config = {
                taskId: '',
                taskName: '',
                sourceType: '',
                destinationType: '',
                sourceFieldName: '',
                targetFieldName: '',
                sourceConfig: {
                    url: '',
                    username: '',
                    password: ''
                },
                destinationConfig: {
                    clusterNodes: '',
                    bootstrapServers: "",
                    disableSslVerification: false,
                    url: '',
                    username: '',
                    password: ''
                },
                syncConfig: {
                    batchSize: 100,
                    minShards: 1,
                    maxShards: 5,
                    coordinatorType: '',
                    coordinatorConfig: {
                        host: '',
                        port: 0
                    }
                },
                fields: []
            };
        }
    },
    actions: {
        async fetchTasks({ commit }) {
            try {
                const response = await getTasks()
                commit('setTasks', response.data.data)
            } catch (error) {
                console.error('获取任务列表失败:', error)
            }
        },
        async saveConfig({ commit, state }) {
            try {
                await saveConfig(state.config)
                commit('addLog', {
                    time: new Date().toLocaleTimeString(),
                    message: '配置保存成功'
                })
                return true
            } catch (error) {
                commit('addLog', {
                    time: new Date().toLocaleTimeString(),
                    message: `配置保存失败: ${error.message}`
                })
                return false
            }
        }
    }
})