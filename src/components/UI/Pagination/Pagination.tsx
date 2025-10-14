import ReactPaginate from "react-paginate";
import {FC} from "react";

interface PaginationProps {
  onPageChange: (selectedItem: { selected: number }) => void;
  pageCount: number;
  forcePage: number;
}

export const Pagination: FC<PaginationProps> = ({
  onPageChange,
  pageCount,
  forcePage,
}) => {
  return (
    <ReactPaginate
      className="flex flex-wrap items-center justify-center gap-2 mt-4 text-gray-500 w-full max-w-full overflow-hidden"
      onPageChange={onPageChange}
      breakLabel="..."
      nextLabel="Next →"
      previousLabel="← Prev"
      pageRangeDisplayed={2}
      pageCount={pageCount}
      forcePage={forcePage}
      renderOnZeroPageCount={null}
      activeClassName="text-brand-500 font-bold px-3 py-2 rounded"
      pageClassName="px-2 py-1 sm:px-3 sm:py-2 hover:bg-gray-200"
      previousClassName="px-2 py-1 sm:px-3 sm:py-2 hover:bg-gray-200"
      nextClassName="px-2 py-1 sm:px-3 sm:py-2 hover:bg-gray-200"
      disabledClassName="text-grey-300 cursor-not-allowed"
      breakClassName="px-2 py-1 sm:px-3 sm:py-2"
    />
  );
};
