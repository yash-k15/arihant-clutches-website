import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useMergeWishlistMutation } from '../slices/wishlistApiSlice.js';
import {
  getGuestWishlist,
  clearGuestWishlist,
} from '../utils/wishlistUtils.js';

const useWishlistMerge = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [mergeWishlist] = useMergeWishlistMutation();

  const previousUserId = useRef(null);

  useEffect(() => {
    // No user logged in
    if (!userInfo?._id) {
      previousUserId.current = null;
      return;
    }

    // Admins should not have wishlist merging
    if (userInfo.isAdmin) {
      previousUserId.current = null;
      return;
    }

    // Don't run again for the same customer
    if (previousUserId.current === userInfo._id) {
      return;
    }

    previousUserId.current = userInfo._id;

    const guestWishlist = getGuestWishlist();

    // Nothing to merge
    if (guestWishlist.length === 0) {
      return;
    }

    const merge = async () => {
      try {
        await mergeWishlist(guestWishlist).unwrap();

        // Only clear local wishlist after successful server merge
        clearGuestWishlist();
      } catch (error) {
        console.error('Failed to merge guest wishlist:', error);
      }
    };

    merge();
  }, [userInfo, mergeWishlist]);
};

export default useWishlistMerge;
