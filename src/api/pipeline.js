import api from './axiosInstance'

/** POST /pipeline/run — naya research job start karo */
export const runPipeline = async (topic) => {
  const { data } = await api.post('/pipeline/run', { topic })
  return data
}

/** GET /pipeline/jobs — mere saare jobs */
export const getMyJobs = async () => {
  const { data } = await api.get('/pipeline/jobs')
  return data
}

/** GET /pipeline/jobs/:id — ek specific job */
export const getJob = async (jobId) => {
  const { data } = await api.get(`/pipeline/jobs/${jobId}`)
  return data
}
