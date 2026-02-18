import React from 'react';

export interface PageHeaderProps {
  /** Page title (required) */
  title: React.ReactNode;
  /** Optional subtitle or short description */
  subtitle?: React.ReactNode;
  /** Optional longer description below subtitle */
  description?: React.ReactNode;
  /** Optional right-side actions (e.g. buttons, badge) */
  actions?: React.ReactNode;
  /** Optional left-side content (e.g. back link for game pages) */
  back?: React.ReactNode;
  /** Center title and subtitle (e.g. auth, home) */
  centered?: boolean;
  /** Use grid layout with back + title + actions (game pages) */
  withBack?: boolean;
}

/**
 * Reusable page header: title (required), optional subtitle/description, optional actions.
 * Use centered for auth/home; use withBack + back + actions for game pages.
 */
export function PageHeader({
  title,
  subtitle,
  description,
  actions,
  back,
  centered = false,
  withBack = false,
}: PageHeaderProps): React.ReactElement {
  const className = [
    'page-header',
    centered && 'page-header--centered',
    withBack && 'page-header--with-back',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={className}>
      <div className="page-header__inner">
        {withBack && back && (
          <div className="page-header__back">{back}</div>
        )}
        <div className="page-header__content">
          <h1 className="page-header__title">{title}</h1>
          {subtitle != null && (
            <p className="page-header__subtitle">{subtitle}</p>
          )}
          {description != null && (
            <p className="page-header__description">{description}</p>
          )}
        </div>
        {actions != null && (
          <div className="page-header__actions">{actions}</div>
        )}
      </div>
    </header>
  );
}

export default PageHeader;
