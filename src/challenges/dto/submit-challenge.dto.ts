import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class SubmitChallengeDto {
  @ApiProperty({
    description: 'URL to the project submission (GitHub, live demo, etc.)',
    example: 'https://github.com/username/challenge-project',
    format: 'url',
  })
  @IsString()
  @IsUrl()
  submission_url: string;

  @ApiProperty({
    description: 'Live demo URL (optional)',
    example: 'https://my-challenge-app.vercel.app',
    required: false,
    format: 'url',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  demoUrl?: string;

  @ApiProperty({
    description: 'Description of the submission and approach taken',
    example:
      'Built a full-stack e-commerce app with React, Node.js, and PostgreSQL. Features include user auth, product catalog, shopping cart, and payment integration.',
    maxLength: 2000,
  })
  @IsString()
  @MaxLength(2000)
  description: string;

  @ApiProperty({
    description: 'Technologies used in the project',
    example: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'TailwindCSS'],
    type: [String],
    required: false,
  })
  @IsOptional()
  technologies?: string[];

  @ApiProperty({
    description: 'Additional notes for judges/voters',
    example: 'Spent extra time on mobile responsiveness and accessibility features.',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
