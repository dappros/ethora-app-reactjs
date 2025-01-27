import { Skeleton } from '@mui/material';
import React, { ReactNode, useEffect, useState } from 'react';

interface SkeletonLoaderProps {
  loading: boolean;
  children: ReactNode;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  loading,
  children,
}) => {
  const [skeletons, setSkeletons] = useState<ReactNode[]>([]);

  useEffect(() => {
    if (loading) {
      const components = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const { width, height, ...restProps } = child.props;
          return (
            <Skeleton
              variant="rectangular"
              width={width || '100%'}
              height={height || 40}
              {...restProps}
            />
          );
        }
        return null;
      });
      // @ts-ignore
      setSkeletons(components);
    }
  }, [loading, children]);

  return <>{loading ? skeletons : children}</>;
};

export default SkeletonLoader;
