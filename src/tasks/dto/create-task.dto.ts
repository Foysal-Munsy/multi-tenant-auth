// Minimal DTO for creating a task.
// (No class-validator here because this project does not enable ValidationPipe yet.)
export class CreateTaskDto {
  title: string;
  description?: string;

  // Optional: assign task to a user (ObjectId string)
  assigned_to?: string;
}
