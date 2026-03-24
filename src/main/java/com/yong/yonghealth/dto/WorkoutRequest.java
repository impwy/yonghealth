package com.yong.yonghealth.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutRequest {

    @NotNull(message = "운동 날짜는 필수입니다")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate workoutDate;

    @NotNull(message = "시작 시간은 필수입니다")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    @Size(max = 500, message = "메모는 500자 이하여야 합니다")
    private String memo;
}
