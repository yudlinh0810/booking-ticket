import { Request, Response } from "express";
import { bookBusTicketsDB } from "../config/db";
import TripService from "../services/trip.service";
import { errorResponse, successResponse } from "../utils/response.util";
import { ArrangeType } from "../@types/type";
import { FormBookedTripType } from "../@types/trip";
export class TripController {
  private tripService = new TripService(bookBusTicketsDB);

  getFormData = async (req: Request, res: Response): Promise<any> => {
    try {
      const result = await this.tripService.getFormData();
      return successResponse(res, 200, result);
    } catch (error) {
      return errorResponse(res, "err getFormData", 500);
    }
  };

  add = async (req: Request, res: Response): Promise<any> => {
    try {
      const { form, seats } = req.body;
      const result = await this.tripService.add(form, seats);
      if (result.status === "ERR") {
        return errorResponse(res, "Add trip failed", 404);
      } else {
        return successResponse(res, 200, result);
      }
    } catch (error) {
      return errorResponse(res, "err add trip", 500);
    }
  };

  getAll = async (req: Request, res: Response): Promise<any> => {
    try {
      const licensePlateSearch = (req.query.license_plate as string) || "";
      const limit = Number(req.query.limit) || 10;
      const offset = Number(req.query.offset);
      const arrangeType =
        (req.query.arrangeType as string)?.toUpperCase() === "ASC"
          ? "ASC"
          : ("DESC" as ArrangeType);

      if (limit < 0 || offset < 0)
        return errorResponse(res, "limit and offset must be greater than 0", 404);

      const result = await this.tripService.getAll(limit, offset, arrangeType, licensePlateSearch);
      return successResponse(res, 200, result);
    } catch (error) {
      return errorResponse(res, "ERR Controller.getAll", 404);
    }
  };

  fetch = async (req: Request, res: Response): Promise<any> => {
    try {
      const id = Number(req.params.id);
      if (!id) return errorResponse(res, "Id invalid", 404);
      const result = await this.tripService.fetch(id);
      return successResponse(res, 200, result);
    } catch (error) {
      return errorResponse(res, "err fetch trip", 500);
    }
  };

  search = async (req: Request, res: Response): Promise<any> => {
    try {
      const { from, to, start_time, sort, limit, offset } = req.query;
      const allowedSortValues = [
        "default",
        "time-asc",
        "time-desc",
        "price-asc",
        "price-desc",
        "rating-desc",
      ] as const;
      type SortType = (typeof allowedSortValues)[number];
      const sortValue: SortType = allowedSortValues.includes(sort as SortType)
        ? (sort as SortType)
        : "default";
      const searchParams = {
        from: Number(from),
        to: Number(to),
        start_time: start_time?.toString().trim() || "",
        sort: sortValue,
        limit: limit ? Number(limit) : 10,
        offset: offset ? Number(offset) : 0,
      };
      const result = await this.tripService.search(searchParams);
      return successResponse(res, 200, result);
    } catch (error) {
      console.log("err search-trip", error);
      return errorResponse(res, "err search trip", 500);
    }
  };

  getDetailTripBooked = async (req: Request, res: Response): Promise<any> => {
    try {
      const formBookedTrip: FormBookedTripType = {
        from: Number(req.query.from),
        to: Number(req.query.to),
        start_day: req.query.start_day as string,
        start_hours: req.query.start_hours as string,
        end_day: req.query.end_day as string,
        end_hours: req.query.end_hours as string,
        license_plate: req.query.license_plate as string,
      };
      const response = await this.tripService.getDetailTripBooked(formBookedTrip);
      if (response.status === "ERR") {
        return errorResponse(res, response.message, 404);
      } else {
        return successResponse(res, 200, response.detailTrip);
      }
    } catch (error) {
      console.log("err get detail trip booked", error);
      return errorResponse(res, "err get detail trip booked trip", 500);
    }
  };
}
