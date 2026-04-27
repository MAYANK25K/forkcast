<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class AnalyticsRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'date_from'  => ['nullable', 'date_format:Y-m-d'],
            'date_to'    => ['nullable', 'date_format:Y-m-d', 'after_or_equal:date_from'],
            'amount_min' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'amount_max' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'hour_from'  => ['nullable', 'integer', 'min:0', 'max:23'],
            'hour_to'    => ['nullable', 'integer', 'min:0', 'max:23'],
            'per_page'   => ['nullable', 'integer', 'min:1', 'max:100'],
            'page'       => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            $min = $this->input('amount_min');
            $max = $this->input('amount_max');
            if ($min !== null && $max !== null && (float) $min > (float) $max) {
                $v->errors()->add('amount_min', 'amount_min must be ≤ amount_max.');
            }
            $hFrom = $this->input('hour_from');
            $hTo   = $this->input('hour_to');
            if ($hFrom !== null && $hTo !== null && (int) $hFrom > (int) $hTo) {
                $v->errors()->add('hour_from', 'hour_from must be ≤ hour_to.');
            }
        });
    }

    public function filters(): array
    {
        return [
            'date_from'  => $this->input('date_from'),
            'date_to'    => $this->input('date_to'),
            'amount_min' => $this->input('amount_min') !== null ? (float) $this->input('amount_min') : null,
            'amount_max' => $this->input('amount_max') !== null ? (float) $this->input('amount_max') : null,
            'hour_from'  => $this->input('hour_from') !== null ? (int) $this->input('hour_from') : null,
            'hour_to'    => $this->input('hour_to')   !== null ? (int) $this->input('hour_to')   : null,
        ];
    }
}
