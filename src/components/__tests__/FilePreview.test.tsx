import React from 'react';
import { render, screen } from '../../utils/test-utils';
import FilePreview from '../FilePreview';

describe('FilePreview', () => {
  const defaultProps = {
    fileName: 'test-file.pdf',
    fileType: 'application/pdf',
    fileSize: 1024 * 1024, // 1MB
    fileUrl: 'https://example.com/test-file.pdf',
  };

  it('renders file name correctly', () => {
    render(<FilePreview {...defaultProps} />);
    expect(screen.getByText('test-file.pdf')).toBeInTheDocument();
  });

  it('formats file size correctly', () => {
    render(<FilePreview {...defaultProps} />);
    expect(screen.getByText('1.0 MB')).toBeInTheDocument();
  });

  it('renders download link correctly', () => {
    render(<FilePreview {...defaultProps} />);
    const downloadLink = screen.getByRole('link');
    expect(downloadLink).toHaveAttribute('href', defaultProps.fileUrl);
    expect(downloadLink).toHaveAttribute('download', defaultProps.fileName);
  });

  it('applies custom className correctly', () => {
    const customClass = 'custom-class';
    render(<FilePreview {...defaultProps} className={customClass} />);
    const container = screen.getByRole('article');
    expect(container).toHaveClass(customClass);
  });

  it('shows image preview for image files', () => {
    render(
      <FilePreview
        {...defaultProps}
        fileName="test.jpg"
        fileType="image/jpeg"
        fileUrl="https://example.com/test.jpg"
      />
    );
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/test.jpg');
    expect(image).toHaveAttribute('alt', 'test.jpg');
  });

  it('shows file icon for non-image files', () => {
    render(<FilePreview {...defaultProps} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    // We can't easily test for the specific icon, but we can test for the container
    expect(screen.getByRole('article')).toBeInTheDocument();
  });
});
