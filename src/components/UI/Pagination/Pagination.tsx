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
      className="flex items-center justify-center gap-2 mt-4 text-gray-500"
      onPageChange={onPageChange}
      breakLabel="..."
      nextLabel="Next →"
      previousLabel="← Prev"
      pageRangeDisplayed={2}
      pageCount={pageCount}
      forcePage={forcePage}
      renderOnZeroPageCount={null}
      activeClassName="text-brand-500 font-bold px-3 py-2 rounded"
      pageClassName="px-3 py-2 hover:bg-gray-200"
      previousClassName="px-3 py-2 hover:bg-gray-200"
      nextClassName="px-3 py-2 hover:bg-gray-200"
      disabledClassName="text-grey-300 cursor-not-allowed"
      breakClassName="px-3 py-2"
    />
  );
};
