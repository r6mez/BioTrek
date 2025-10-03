import { ApiProperty } from '@nestjs/swagger';

export class SourceDocument {
  @ApiProperty({
    description: 'The title of the source document',
    example: 'NASA BioTrek Research Paper',
  })
  title: string;

  @ApiProperty({
    description: 'Link to the source document',
    example: 'https://example.com/paper.pdf',
  })
  link: string;

  @ApiProperty({
    description: 'Publication date of the document',
    example: '2023-01-15',
  })
  pub_date: string;

  @ApiProperty({
    description: 'Content snippet from the document',
    example: 'This research focuses on...',
  })
  content?: string;
}

export class ChatbotResponseDto {
  @ApiProperty({
    description: 'The chatbot response to the query',
    example: 'NASA BioTrek research focuses on space biology...',
  })
  answer: string;

  @ApiProperty({
    description: 'Source documents used to generate the answer',
    type: [SourceDocument],
  })
  sources?: SourceDocument[];

  @ApiProperty({
    description: 'Timeline of source documents',
    example: ['2020-01-01 | Document 1', '2021-06-15 | Document 2'],
  })
  timeline?: string[];

  @ApiProperty({
    description: 'References list',
    example: ['[1] Document Title — link', '[2] Another Document — link'],
  })
  references?: string[];

  @ApiProperty({
    description: 'Processing time in milliseconds',
    example: 1250,
  })
  processingTime?: number;

  @ApiProperty({
    description: 'Chart data for visualization',
    example: [{ name: 'A', value: 100 }, { name: 'B', value: 200 }],
    required: false,
  })
  chartData?: any[];

  @ApiProperty({
    description: 'Type of chart to render (line, bar, pie, area, scatter)',
    example: 'bar',
    required: false,
  })
  chartType?: string;

  @ApiProperty({
    description: 'Title for the chart',
    example: 'Monthly Statistics',
    required: false,
  })
  chartTitle?: string;
}

