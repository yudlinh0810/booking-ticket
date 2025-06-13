import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/response.util";
import { RequestWithProcessedFiles, RequestFile } from "../middlewares/uploadHandler";
import { bookBusTicketsDB } from "../config/db";
import { CarService } from "../services/car.service";
import { ArrangeType } from "../@types/type";
import { typeMap } from "../@types/car.type";

export class CarController {
  private carService = new CarService(bookBusTicketsDB);

  private static parsePagination(query: any) {
    const limit = parseInt(query.limit as string) || 5;
    const offset = parseInt(query.offset as string) || 0;
    return { limit, offset };
  }

  addCar = async (req: RequestWithProcessedFiles, res: Response): Promise<any> => {
    try {
      const files = req.processedFiles;
      const data = JSON.parse(req.body.data);
      const response = await this.carService.addCar(data, files);
      if (response.status === "ERR") {
        return errorResponse(res, response.message, 400);
      }
      return successResponse(res, 200, response);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };

  updateCar = async (req: RequestWithProcessedFiles, res: Response): Promise<any> => {
    try {
      const data = JSON.parse(req.body.data);
      const result = await this.carService.updateCar(data, req.processedFiles);
      return successResponse(res, 200, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };

  deleteCar = async (req: Request, res: Response): Promise<any> => {
    try {
      const id = Number(req.params.id);
      const result = await this.carService.deleteCar(id);
      return successResponse(res, 200, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };

  getAllCar = async (req: Request, res: Response): Promise<any> => {
    try {
      const licensePlateSearch = (req.query.license_plate as string) || "";
      const limit = Number(req.query.limit) || 10;
      const offset = Number(req.query.offset);
      const typeKey = (req.query.type as string) || undefined;

      const type = typeKey ? typeMap[typeKey] : "";

      const arrangeType =
        (req.query.arrangeType as string)?.toUpperCase() === "ASC"
          ? "ASC"
          : ("DESC" as ArrangeType);

      if (limit < 0 || offset < 0)
        return errorResponse(res, "limit and offset must be greater than 0", 404);

      const result = await this.carService.getAll(
        limit,
        offset,
        arrangeType,
        licensePlateSearch,
        type
      );
      return successResponse(res, 200, result);
    } catch (error: any) {
      console.log("err", error);
      return errorResponse(res, error.message, 500);
    }
  };

  getCarByLicensePlate = async (req: Request, res: Response): Promise<any> => {
    try {
      const licensePlate = req.params.licensePlate;
      if (!licensePlate) return errorResponse(res, "Car license plate not exist!");
      const result = await this.carService.getCarByLicensePlate(req.params.licensePlate);
      return successResponse(res, 200, result);
    } catch (error: any) {
      console.log("err", error);
      return errorResponse(res, error.message, 500);
    }
  };

  updateImgCar = async (req: RequestFile, res: Response): Promise<any> => {
    try {
      const data = JSON.parse(req.body.data);
      const result = await this.carService.updateImgCar(data, req.uploadedImage);
      return successResponse(res, 200, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };

  deleteImgCar = async (req: Request, res: Response): Promise<any> => {
    try {
      const result = await this.carService.deleteImgCar(req.body);
      return successResponse(res, 200, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };
}
