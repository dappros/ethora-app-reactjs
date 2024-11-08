import cn from 'classnames';

interface Props {
  columns: Array<string>;
}

export function TableHead({ columns }: Props) {
  return (
    <thead className="border-0 border-collapse font-inter font-normal text-xs">
      <tr>
        {columns.map((text, i, arr) => {
          return (
            <th
              key={i}
              className={cn(
                "py-2 relative after:content-[''] after:absolute after:right-0 after:top-[5px] after:bottom-[5px] after:bg-gray-200 after:w-[1px] font-normal border-0 text-gray-500 bg-gray-50 ",
                {
                  'rounded-l-xl': i === 0,
                  'rounded-r-xl': i === arr.length - 1,
                  'after:hidden': i === arr.length - 1,
                }
              )}
            >
              {text}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}
