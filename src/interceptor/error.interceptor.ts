import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, catchError, throwError } from "rxjs";

@Injectable()
export class ErrorHandlingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(catchError(err => {
            console.error('Error:', err);
            return throwError(() => err);
        }));
    }
}