import { useState } from 'react'
import { queryTask } from '../api/tasksApi'
import TaskInputForm from '../components/TaskInputForm'
import TaskResultPreview from '../components/TaskResultPreview'

// Friendly messages for the response shapes the query endpoint can return —
// never show a raw error object to the citizen.
function messageForResponse(response) {
  if (response.status === 404) {
    return response.error || "We don't have information on this yet. Try describing it differently."
  }
  if (response.status === 429 || response.status === 502) {
    return 'Something went wrong — please wait a moment and try again.'
  }
  return 'Something went wrong — please wait a moment and try again.'
}

function TaskInputPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit({ text, city }) {
    setIsLoading(true)
    setErrorMessage('')
    setResult(null)

    try {
      const response = await queryTask({ text, city })
      if (response.success) {
        setResult(response.data)
      } else {
        setErrorMessage(messageForResponse(response))
      }
    } catch {
      setErrorMessage('Could not reach the server — please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 bg-slate-50 px-4 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-slate-900">CivicPath</h1>
        <p className="text-slate-500">Tell us what you need, in your own words.</p>
      </div>

      <TaskInputForm onSubmit={handleSubmit} isLoading={isLoading} />

      {errorMessage && (
        <p className="w-full max-w-xl rounded-md bg-amber-50 p-3 text-amber-800">
          {errorMessage}
        </p>
      )}

      {result && <TaskResultPreview task={result.task} steps={result.steps} />}
    </main>
  )
}

export default TaskInputPage
