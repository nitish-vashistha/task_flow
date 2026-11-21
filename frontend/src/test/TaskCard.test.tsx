import { fireEvent, render, screen } from '@testing-library/react'
import TaskCard from '../components/TaskCard'
import { Task } from '../types'

describe('TaskCard', () => {
  const mockTask: Task = {
    id: 1,
    title: 'Design database schema',
    description: 'Postgres or H2 setup',
    status: 'TODO',
    priority: 'HIGH',
    dueDate: '2099-12-31',
    assigneeId: 2,
    assigneeName: 'Alex Morgan',
  }

  const mockEdit = vi.fn()
  const mockDelete = vi.fn()
  const mockStatusChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders task details correctly', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockEdit}
        onDelete={mockDelete}
        onStatusChange={mockStatusChange}
      />
    )

    expect(screen.getByText('Design database schema')).toBeInTheDocument()
    expect(screen.getByText('Postgres or H2 setup')).toBeInTheDocument()
    expect(screen.getByText('HIGH')).toBeInTheDocument()
    expect(screen.getByText(/Alex Morgan/)).toBeInTheDocument()
  })

  it('triggers onEdit when task title is clicked', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockEdit}
        onDelete={mockDelete}
        onStatusChange={mockStatusChange}
      />
    )

    fireEvent.click(screen.getByText('Design database schema'))
    expect(mockEdit).toHaveBeenCalledWith(mockTask)
  })

  it('triggers onStatusChange when dropdown value changes', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockEdit}
        onDelete={mockDelete}
        onStatusChange={mockStatusChange}
      />
    )

    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'IN_PROGRESS' } })
    expect(mockStatusChange).toHaveBeenCalledWith(1, 'IN_PROGRESS')
  })

  it('highlights task as overdue if due date is in the past', () => {
    const overdueTask: Task = {
      ...mockTask,
      dueDate: '2020-01-01',
      status: 'TODO',
    }

    render(
      <TaskCard
        task={overdueTask}
        onEdit={mockEdit}
        onDelete={mockDelete}
        onStatusChange={mockStatusChange}
      />
    )

    expect(screen.getByText(/Overdue/)).toBeInTheDocument()
  })
})
